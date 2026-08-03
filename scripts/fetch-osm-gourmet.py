#!/usr/bin/env python3
"""
Fetch eating and drinking places in Akihabara from OpenStreetMap via Overpass
and cache the raw result under data/raw/.

The raw file is gitignored: re-run this script to refresh it. Nothing here
touches data/spots.json — see merge-osm-gourmet.py for that.

OpenStreetMap data is ODbL-licensed. Anything derived from this file must
credit "OpenStreetMap contributors" wherever it is published.

Usage:
  python3 scripts/fetch-osm-gourmet.py          # uses the cache if it is fresh
  python3 scripts/fetch-osm-gourmet.py --force  # always re-query Overpass
"""
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "data" / "raw"
OUT_FILE = RAW_DIR / "osm-gourmet.json"

# Akihabara core: Sotokanda plus the Kanda-Sakumacho / Neribeicho blocks that
# the site already writes about. Deliberately excludes Kanda proper, Ochanomizu
# and Iwamotocho — this is an Akihabara publication, not a Chiyoda one.
BBOX = "35.6960,139.7690,35.7030,139.7760"

AMENITIES = "restaurant|cafe|fast_food|bar|pub|ice_cream"

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

CACHE_MAX_AGE_DAYS = 14
USER_AGENT = "akiba-live-spots/1.0 (https://akiba.reload.co.jp)"


def build_query():
    return f"""
[out:json][timeout:90];
(
  node["amenity"~"^({AMENITIES})$"]({BBOX});
  way["amenity"~"^({AMENITIES})$"]({BBOX});
);
out center tags;
"""


def cache_age_days():
    if not OUT_FILE.exists():
        return None
    try:
        payload = json.loads(OUT_FILE.read_text(encoding="utf-8"))
        fetched = datetime.fromisoformat(payload["fetchedAt"])
    except (json.JSONDecodeError, KeyError, ValueError):
        return None
    return (datetime.now(timezone.utc) - fetched).days


def fetch():
    data = urllib.parse.urlencode({"data": build_query()}).encode()
    last_error = None
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(3):
            try:
                req = urllib.request.Request(
                    endpoint, data=data, headers={"User-Agent": USER_AGENT}
                )
                with urllib.request.urlopen(req, timeout=120) as resp:
                    return json.load(resp)
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                last_error = exc
                # Overpass rate-limits aggressively; back off rather than hammer it.
                wait = 5 * (attempt + 1)
                print(f"  {endpoint} failed ({exc}); retrying in {wait}s", file=sys.stderr)
                time.sleep(wait)
    raise SystemExit(f"FATAL: every Overpass endpoint failed. Last error: {last_error}")


def main():
    force = "--force" in sys.argv

    age = cache_age_days()
    if not force and age is not None and age < CACHE_MAX_AGE_DAYS:
        print(f"Cache is {age} day(s) old ({OUT_FILE}). Use --force to refresh.")
        return 0

    print(f"Querying Overpass for {AMENITIES} in bbox {BBOX} ...")
    result = fetch()

    elements = [e for e in result.get("elements", []) if e.get("tags", {}).get("name")]
    print(f"  {len(result.get('elements', []))} elements, {len(elements)} with a name")

    by_amenity = Counter(e["tags"].get("amenity") for e in elements)
    print("  by amenity:", dict(by_amenity.most_common()))

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "source": "OpenStreetMap contributors",
        "license": "ODbL 1.0",
        "bbox": BBOX,
        "elements": elements,
    }
    OUT_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {OUT_FILE.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
