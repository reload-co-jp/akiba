#!/usr/bin/env python3
"""
Fill in lat/lng for spots that have an address but no coordinates, using the
Geospatial Information Authority of Japan (GSI) address search API.

Coordinates matter beyond the map link: the gourmet index sorts by distance
from the station and shows it on every row, so a spot without them sorts last
and tells the reader nothing about where it is.

Every result is checked against the Akihabara bounding box before being
accepted. The geocoder will happily return a plausible-looking point for an
address it only partially understood, and a silently wrong coordinate is worse
than none at all — anything outside the box is reported and skipped.

Dry run by default. Pass --write to apply.

Usage:
  python3 scripts/geocode-spots.py
  python3 scripts/geocode-spots.py --write
"""
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SPOTS_JSON = REPO_ROOT / "data" / "spots.json"

ENDPOINT = "https://msearch.gsi.go.jp/address-search/AddressSearch"
USER_AGENT = "akiba-live-spots/1.0 (https://akiba.reload.co.jp)"

# Generous box around Akihabara. Anything outside means the geocoder matched
# something else entirely.
LAT_RANGE = (35.690, 35.710)
LNG_RANGE = (139.765, 139.785)

# Be polite: the GSI service is free and unauthenticated.
REQUEST_INTERVAL_SECONDS = 1.0


def geocode(address):
    url = f"{ENDPOINT}?q={urllib.parse.quote(address)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            results = json.load(resp)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        return None, f"request failed: {exc}"

    if not results:
        return None, "no match"

    best = results[0]
    lng, lat = best["geometry"]["coordinates"]
    title = best.get("properties", {}).get("title", "")

    if not (LAT_RANGE[0] <= lat <= LAT_RANGE[1] and LNG_RANGE[0] <= lng <= LNG_RANGE[1]):
        return None, f"outside Akihabara: {lat:.6f},{lng:.6f} ({title})"

    return (round(lat, 6), round(lng, 6), title), None


def main():
    write = "--write" in sys.argv

    spots = json.loads(SPOTS_JSON.read_text(encoding="utf-8"))
    targets = [
        s for s in spots
        if s.get("address") and (s.get("lat") is None or s.get("lng") is None)
    ]

    if not targets:
        print("Every spot with an address already has coordinates.")
        return 0

    print(f"{len(targets)} spot(s) need coordinates.\n")

    resolved = 0
    failed = []
    for i, spot in enumerate(targets):
        if i:
            time.sleep(REQUEST_INTERVAL_SECONDS)
        result, error = geocode(spot["address"])
        if error:
            failed.append((spot["slug"], error))
            print(f"  SKIP {spot['name']} — {error}")
            continue
        lat, lng, title = result
        spot["lat"] = lat
        spot["lng"] = lng
        resolved += 1
        print(f"  OK   {spot['name']} -> {lat},{lng}")
        print(f"       matched: {title}")

    print(f"\nresolved {resolved}, skipped {len(failed)}")

    if not write:
        print("\nDry run. Re-run with --write to apply.")
        return 0

    SPOTS_JSON.write_text(
        json.dumps(spots, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nUpdated {resolved} spot(s) in data/spots.json.")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
