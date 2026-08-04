#!/usr/bin/env python3
"""
Give spots that have coordinates but no address a town-level address, using
the GSI reverse geocoder.

This produces addresses like "東京都千代田区外神田一丁目" — ward and chome,
with no block or building number. That is as far as a coordinate can honestly
be resolved: the reverse geocoder answers "which town is this point in", not
"which building". Spots enriched this way are marked addressSource=gsi-reverse
so a later, better source can overwrite them without ambiguity.

Responses are cached under data/raw/ keyed by coordinate, so an interrupted
run resumes instead of re-requesting several hundred addresses.

Dry run by default. Pass --write to apply.

Usage:
  python3 scripts/reverse-geocode-spots.py
  python3 scripts/reverse-geocode-spots.py --write
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SPOTS_JSON = REPO_ROOT / "data" / "spots.json"
RAW_DIR = REPO_ROOT / "data" / "raw"
CACHE_FILE = RAW_DIR / "reverse-geocode-cache.json"
MUNI_CACHE = RAW_DIR / "gsi-muni.js"

REVERSE_ENDPOINT = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress"
MUNI_URL = "https://maps.gsi.go.jp/js/muni.js"
USER_AGENT = "akiba-live-spots/1.0 (https://akiba.reload.co.jp)"

# A free, unauthenticated public service. One request per second.
REQUEST_INTERVAL_SECONDS = 1.0

# Akihabara sits across these two wards; anything else means the coordinate is
# not where we think it is.
EXPECTED_WARDS = {"千代田区", "台東区"}


def load_muni_table():
    """muni.js maps GSI municipality codes to names, as lines of the form
    GSI.MUNI_ARRAY["13101"] = '13,東京都,13101,千代田区';"""
    if MUNI_CACHE.exists():
        text = MUNI_CACHE.read_text(encoding="utf-8", errors="ignore")
    else:
        req = urllib.request.Request(MUNI_URL, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=60) as resp:
            text = resp.read().decode("utf-8", "ignore")
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        MUNI_CACHE.write_text(text, encoding="utf-8")

    table = {}
    for code, value in re.findall(r"MUNI_ARRAY\[\"(\d+)\"\]\s*=\s*'([^']+)'", text):
        parts = value.split(",")
        if len(parts) >= 4:
            table[code] = (parts[1], parts[3])  # (prefecture, municipality)
    return table


def load_cache():
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    return {}


def save_cache(cache):
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def reverse_geocode(lat, lng):
    url = f"{REVERSE_ENDPOINT}?lat={lat}&lon={lng}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def main():
    write = "--write" in sys.argv

    muni = load_muni_table()
    cache = load_cache()
    spots = json.loads(SPOTS_JSON.read_text(encoding="utf-8"))

    targets = [
        s for s in spots
        if s.get("lat") is not None and s.get("lng") is not None and not s.get("address")
    ]
    print(f"{len(targets)} spot(s) have coordinates but no address.")
    print(f"cache holds {len(cache)} previous lookup(s).\n")

    resolved = {}
    skipped = []
    requests_made = 0

    for spot in targets:
        key = f"{spot['lat']},{spot['lng']}"

        if key not in cache:
            if requests_made:
                time.sleep(REQUEST_INTERVAL_SECONDS)
            try:
                cache[key] = reverse_geocode(spot["lat"], spot["lng"])
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                skipped.append((spot["slug"], f"request failed: {exc}"))
                continue
            requests_made += 1
            if requests_made % 50 == 0:
                save_cache(cache)
                print(f"  ... {requests_made} lookups")

        result = (cache.get(key) or {}).get("results") or {}
        muni_code = result.get("muniCd")
        town = result.get("lv01Nm")

        if not muni_code or not town:
            skipped.append((spot["slug"], "no result"))
            continue

        entry = muni.get(str(muni_code).zfill(5))
        if not entry:
            skipped.append((spot["slug"], f"unknown muniCd {muni_code}"))
            continue

        prefecture, ward = entry
        if ward not in EXPECTED_WARDS:
            skipped.append((spot["slug"], f"unexpected ward {ward}"))
            continue

        resolved[spot["slug"]] = f"{prefecture}{ward}{town}"

    save_cache(cache)

    print(f"\nresolved {len(resolved)}, skipped {len(skipped)}")
    print(f"network lookups this run: {requests_made}")

    if skipped:
        print("\nskipped:")
        for slug, why in skipped[:15]:
            print(f"  - {slug}: {why}")
        if len(skipped) > 15:
            print(f"  ... and {len(skipped) - 15} more")

    sample = list(resolved.items())[:8]
    print("\nsample:")
    for slug, address in sample:
        print(f"  {slug}: {address}")

    if not write:
        print("\nDry run. Re-run with --write to apply.")
        return 0

    by_slug = {s["slug"]: s for s in spots}
    for slug, address in resolved.items():
        by_slug[slug]["address"] = address
        by_slug[slug]["addressSource"] = "gsi-reverse"

    SPOTS_JSON.write_text(
        json.dumps(spots, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nUpdated {len(resolved)} spot(s) in data/spots.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
