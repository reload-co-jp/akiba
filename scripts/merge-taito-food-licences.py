#!/usr/bin/env python3
"""
Fill in addresses for spots that have none, using Taito City's published list
of licensed food businesses.

Why this is worth so little, and why it is still here:

Akihabara straddles two wards. The bulk of it — Sotokanda, Kanda-Sakumacho,
Kanda-Neribeicho — is Chiyoda City, which publishes no food-licence open data
at all (no datasets in the Tokyo catalogue, no ward open-data portal). Only the
strip north-east of the station is Taito City. So this covers a couple of dozen
rows in our bounding box and matches a handful of spots. Those few addresses
are official records rather than guesses, which is why it is worth running,
but do not expect it to scale — there is no equivalent source for the Chiyoda
side.

The CSV carries its own 緯度/経度 columns, so no geocoding is needed. A name
match alone would be unsafe: one building geocodes to a single point and can
hold half a dozen businesses, so a match needs both the name and the location.

Dry run by default. Pass --write to apply.

Usage:
  python3 scripts/merge-taito-food-licences.py
  python3 scripts/merge-taito-food-licences.py --write
"""
import csv
import io
import json
import math
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SPOTS_JSON = REPO_ROOT / "data" / "spots.json"
RAW_DIR = REPO_ROOT / "data" / "raw"
CACHE_FILE = RAW_DIR / "taito-food-licences.csv"

CSV_URL = (
    "https://www.city.taito.lg.jp/kenkohukusi/kenkokikikanrieisei/food/"
    "syokuhin-sisetu/index.files/2026ALL-IND-CSV.csv"
)
USER_AGENT = "akiba-live-spots/1.0 (https://akiba.reload.co.jp)"

# Same Akihabara core as scripts/fetch-osm-gourmet.py.
BBOX = (35.6960, 139.7690, 35.7030, 139.7760)

# Both the name and the position have to agree before we accept a row.
MATCH_METRES = 100


def normalise_name(name):
    """The CSV stores names in full-width characters (ＭＯＧＲＡ), so fold width
    and drop the separators that only one of the two sources tends to use."""
    n = unicodedata.normalize("NFKC", name)
    n = re.sub(r"[\s・]+", "", n)
    return n.casefold()


def distance_metres(a_lat, a_lng, b_lat, b_lng):
    mean_lat = math.radians((a_lat + b_lat) / 2)
    x = math.radians(b_lng - a_lng) * math.cos(mean_lat)
    y = math.radians(b_lat - a_lat)
    return math.hypot(x, y) * 6371000


def load_csv_text():
    if CACHE_FILE.exists():
        return CACHE_FILE.read_bytes().decode("cp932")
    req = urllib.request.Request(CSV_URL, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=90) as resp:
        raw = resp.read()
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_bytes(raw)
    return raw.decode("cp932")


def load_area_records():
    rows = list(csv.reader(io.StringIO(load_csv_text())))
    idx = {name: i for i, name in enumerate(rows[0])}
    records = []
    for row in rows[1:]:
        try:
            lat = float(row[idx["緯度"]])
            lng = float(row[idx["経度"]])
        except (ValueError, IndexError, KeyError):
            continue
        if not (BBOX[0] <= lat <= BBOX[2] and BBOX[1] <= lng <= BBOX[3]):
            continue
        street = row[idx["営業所所在地"]].strip()
        building = row[idx["営業所方書"]].strip()
        records.append(
            {
                "name": row[idx["屋号"]].strip(),
                "address": f"東京都台東区{street}{building}",
                "lat": lat,
                "lng": lng,
            }
        )
    return records, len(rows) - 1


def main():
    write = "--write" in sys.argv

    records, total = load_area_records()
    spots = json.loads(SPOTS_JSON.read_text(encoding="utf-8"))
    targets = [s for s in spots if s.get("lat") is not None and not s.get("address")]

    print(f"CSV rows: {total}, inside the Akihabara box: {len(records)}")
    print(f"Spots missing an address: {len(targets)}\n")

    matched = {}
    for record in records:
        record_name = normalise_name(record["name"])
        for spot in targets:
            if spot["slug"] in matched:
                continue
            spot_name = normalise_name(spot["name"])
            same_name = record_name == spot_name or (
                len(record_name) >= 3
                and len(spot_name) >= 3
                and (record_name in spot_name or spot_name in record_name)
            )
            if not same_name:
                continue
            gap = distance_metres(
                record["lat"], record["lng"], spot["lat"], spot["lng"]
            )
            if gap <= MATCH_METRES:
                matched[spot["slug"]] = (spot, record, round(gap))
                break

    print(f"=== matched {len(matched)} spot(s) ===")
    for spot, record, gap in matched.values():
        print(f"  {spot['name']}")
        print(f"    <- {record['name']} ({gap}m)")
        print(f"    {record['address']}")

    if not matched:
        print("\nNothing to apply.")
        return 0

    if not write:
        print("\nDry run. Re-run with --write to apply.")
        return 0

    by_slug = {s["slug"]: s for s in spots}
    for slug, (_, record, _) in matched.items():
        by_slug[slug]["address"] = record["address"]
        # Record where the *address* came from, and leave dataSource alone:
        # the spot itself is still an OSM record, and that is what obliges us
        # to credit OpenStreetMap.
        by_slug[slug]["addressSource"] = "taito-opendata"

    SPOTS_JSON.write_text(
        json.dumps(spots, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\nUpdated {len(matched)} spot(s) in data/spots.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
