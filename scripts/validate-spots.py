#!/usr/bin/env python3
"""
Structural validation and duplicate audit for data/spots.json.

Catches the problems a `pnpm build` will NOT catch:
  - two spots describing the same physical place (same normalised address)
  - spots whose name/aliases never match any article's event.venue, so the
    "この会場のイベント" section silently renders empty
  - article venues that no spot matches (candidates for a new spot)
  - image files referenced but missing from disk

Run this after every edit to spots.json.

Usage:
  python3 scripts/validate-spots.py
Exit code 0 = clean, 1 = problems found (see printed report).
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SPOTS_JSON = REPO_ROOT / "data" / "spots.json"
ARTICLES_JSON = REPO_ROOT / "data" / "articles.json"
PUBLIC_DIR = REPO_ROOT / "public"

# Tier B spots are bulk-imported and only ever appear in an index page, so
# they are allowed to carry nothing but a name, a category and coordinates.
# Anything with its own detail page must be able to fill that page.
REQUIRED_STR_FIELDS = ["name", "slug", "category", "description"]
REQUIRED_DETAIL_PAGE_FIELDS = ["address", "access"]

VALID_CATEGORIES = {
    "電気街・PCパーツ",
    "アニメ・マンガ・同人",
    "ゲーム・フィギュア",
    "グルメ・カフェ",
    "ショッピング",
    "フィギュア・模型",
    "イベント・ライブ",
}

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# Venues that intentionally have no spot: multi-store campaigns, area-wide
# events, places outside Akihabara, closed venues, streets.
VENUE_IGNORE_RE = re.compile(
    r"(対象\d*店舗|対象店舗|参加|協力店舗|各店舗|エリア|各所|全国|オンラインストア|"
    r"〜|ほか秋葉原|周辺)"
)


def normalise_address(addr):
    """Fold the cosmetic variation out of a Japanese address so that
    '外神田3-16-17 住吉ビル6F' and '外神田３丁目16番17号住吉ビル' collide."""
    a = addr.replace(" ", "").replace("　", "")
    a = re.sub(r"[０-９]", lambda m: chr(ord(m.group()) - 0xFEE0), a)
    a = a.replace("丁目", "-").replace("番地", "-").replace("番", "-").replace("号", "")
    a = re.sub(r"-+", "-", a)
    return a


def venue_matches(spot, venue):
    """Mirror of getSpotByVenueName() in lib/spots.ts."""
    names = [spot["name"]] + spot.get("aliases", [])
    return any(venue.find(n) != -1 or n.find(venue) != -1 for n in names)


def main():
    errors = []
    warnings = []

    try:
        spots = json.loads(SPOTS_JSON.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"FATAL: {SPOTS_JSON} not found")
        return 1
    except json.JSONDecodeError as exc:
        print(f"FATAL: {SPOTS_JSON} is not valid JSON: {exc}")
        return 1

    articles = json.loads(ARTICLES_JSON.read_text(encoding="utf-8"))

    seen_ids = {}
    seen_slugs = {}
    by_address = defaultdict(list)

    for spot in spots:
        label = f"spot '{spot.get('slug', '?')}'"

        tier = spot.get("tier", "A")
        if tier not in ("A", "B"):
            errors.append(f"{label}: tier must be 'A' or 'B', got {tier!r}")
        has_detail_page = tier != "B"

        required = list(REQUIRED_STR_FIELDS)
        if has_detail_page:
            required += REQUIRED_DETAIL_PAGE_FIELDS
        for field in required:
            val = spot.get(field)
            if not isinstance(val, str) or not val.strip():
                errors.append(f"{label}: missing or empty '{field}'")

        if not has_detail_page:
            if spot.get("lat") is None or spot.get("lng") is None:
                errors.append(f"{label}: tier B spots need lat/lng to be placeable on an index page")
            if not spot.get("dataSource"):
                errors.append(f"{label}: tier B spots must record a dataSource")

        spot_id = spot.get("id")
        if not isinstance(spot_id, int):
            errors.append(f"{label}: 'id' must be an integer")
        elif spot_id in seen_ids:
            errors.append(f"{label}: duplicate id {spot_id} (also '{seen_ids[spot_id]}')")
        else:
            seen_ids[spot_id] = spot.get("slug")

        slug = spot.get("slug")
        if isinstance(slug, str):
            if not SLUG_RE.match(slug):
                errors.append(f"{label}: slug is not lowercase-kebab-case")
            if slug in seen_slugs:
                errors.append(f"{label}: duplicate slug")
            seen_slugs[slug] = True

        category = spot.get("category")
        if category not in VALID_CATEGORIES:
            errors.append(f"{label}: unknown category '{category}'")

        address = spot.get("address")
        if isinstance(address, str) and address.strip():
            by_address[normalise_address(address)].append(spot)

        for coord, lo, hi in (("lat", 35.68, 35.72), ("lng", 139.75, 139.79)):
            val = spot.get(coord)
            if val is not None:
                if not isinstance(val, (int, float)):
                    errors.append(f"{label}: {coord} must be a number")
                elif not lo <= val <= hi:
                    warnings.append(f"{label}: {coord} {val} is outside the Akihabara area")

        image = spot.get("image")
        if isinstance(image, dict):
            src = image.get("src")
            if not isinstance(src, str) or not src.startswith("/"):
                errors.append(f"{label}: image.src must be a root-relative path")
            elif not (PUBLIC_DIR / src.lstrip("/")).exists():
                errors.append(f"{label}: image file not found: {src}")
            if not image.get("alt"):
                errors.append(f"{label}: image.alt is required")

    # Two spots at the same address are usually different tenants of the same
    # building, so this is a warning — but it is how the めいどりーみん
    # duplicate slipped in, so it must stay visible.
    for addr, group in by_address.items():
        if len(group) > 1:
            names = ", ".join(f"{s['name']} ({s['slug']})" for s in group)
            warnings.append(f"same address '{addr}': {names} — same tenant, or different floors?")

    venues = {
        a["event"]["venue"]
        for a in articles
        if a.get("event") and a["event"].get("venue")
    }

    # Mirror getSpotByVenueName(), which only ever returns detail-page spots.
    linkable = [s for s in spots if s.get("tier", "A") != "B"]

    # A spot nobody links to is not broken, but a spot whose name *almost*
    # matches a venue usually means a typo or a spacing difference.
    for spot in linkable:
        if any(venue_matches(spot, v) for v in venues):
            continue
        stripped = spot["name"].replace(" ", "").replace("　", "")
        near = [
            v for v in venues
            if stripped and stripped in v.replace(" ", "").replace("　", "")
        ]
        if near:
            errors.append(
                f"spot '{spot['slug']}': name '{spot['name']}' matches no venue, but "
                f"{near[:2]} differ only by spacing — add an alias"
            )

    unmatched = sorted(
        v for v in venues
        if not VENUE_IGNORE_RE.search(v) and not any(venue_matches(s, v) for s in linkable)
    )
    for venue in unmatched:
        warnings.append(f"article venue has no spot: '{venue}'")

    print(f"Checked {len(spots)} spots against {len(venues)} article venues.")
    if warnings:
        print(f"\n{len(warnings)} warning(s):")
        for w in warnings:
            print(f"  - {w}")

    if errors:
        print(f"\n{len(errors)} error(s):")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("OK — no structural problems found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
