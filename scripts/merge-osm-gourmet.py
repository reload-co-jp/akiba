#!/usr/bin/env python3
"""
Merge the cached OpenStreetMap eating places into data/spots.json as tier B
spots (index-page only, no detail page of their own).

Everything imported here lands as tier B on purpose. Tier A requires an
address *and* walking directions, and OSM has neither for most places, so
promotion is a deliberate enrichment step rather than something this script
guesses at.

Places we already cover are skipped rather than duplicated:

  - identical name              -> same place, skip
  - one name contains the other -> only the same place if they are within 50m,
                                   or if the existing spot has no coordinates
                                   to judge by

The containment rule has to be tight. Akihabara is full of chains and spin-off
branches — "アキバ絶対領域" and "アキバ絶対領域 A.D.1912" are 41m apart and are
genuinely different shops, as are the several めいどりーみん branches. Anything
imported that still sits near a similarly-named existing spot is printed for
review rather than silently dropped.

Dry run by default. Pass --write to actually modify data/spots.json.

Usage:
  python3 scripts/merge-osm-gourmet.py            # report only
  python3 scripts/merge-osm-gourmet.py --write    # apply
"""
import json
import math
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SPOTS_JSON = REPO_ROOT / "data" / "spots.json"
RAW_FILE = REPO_ROOT / "data" / "raw" / "osm-gourmet.json"

# A partial name match only means "same place" when they are practically on
# top of each other. Anything looser and separate branches get swallowed.
SAME_PLACE_METRES = 25
# Imported spots this close to a similarly-named existing spot get flagged.
REVIEW_METRES = 150

# OSM cuisine values are already slug-shaped; we only fold obvious synonyms so
# that the index pages don't end up with both "coffee_shop" and "cafe".
CUISINE_SYNONYMS = {
    "coffee_shop": "cafe",
    "coffee": "cafe",
    "tea": "cafe",
    "cake": "cafe",
    "dessert": "sweets",
    "ice_cream": "sweets",
    "sweets": "sweets",
    "noodles": "noodle",
    "yakitori": "izakaya",
    "japanese;ramen": "ramen",
    # Two keys that mean the same shop would otherwise produce two index
    # pages with identical headings, competing for the same search query.
    "barbecue": "yakiniku",
    "steak_house": "steak",
    "italian_pizza": "pizza",
    "shabushabu": "shabu_shabu",
    "gyukatsu": "tonkatsu",
    "pork_bowl": "donburi",
    "fries": "fried_food",
    # Too vague to be a category of its own.
    "cuisine": "",
}

# Fallback when a place carries no cuisine tag at all.
AMENITY_FALLBACK_CUISINE = {
    "cafe": "cafe",
    "bar": "bar",
    "pub": "izakaya",
    "ice_cream": "sweets",
}


def normalise_name(name):
    """Fold width, case and spacing so 'めいどりーみん 秋葉原本店' and
    'めいどりーみん秋葉原本店' compare equal."""
    n = unicodedata.normalize("NFKC", name)
    n = re.sub(r"\s+", "", n)
    return n.casefold()


def distance_metres(a_lat, a_lng, b_lat, b_lng):
    """Equirectangular approximation — plenty accurate at this scale."""
    mean_lat = math.radians((a_lat + b_lat) / 2)
    x = math.radians(b_lng - a_lng) * math.cos(mean_lat)
    y = math.radians(b_lat - a_lat)
    return math.hypot(x, y) * 6371000


def element_coords(el):
    if "lat" in el and "lon" in el:
        return el["lat"], el["lon"]
    center = el.get("center") or {}
    if "lat" in center and "lon" in center:
        return center["lat"], center["lon"]
    return None, None


def compose_address(tags):
    """Japanese OSM addresses are split across tags and are usually partial.
    Only build a string when we have enough for it to be actionable."""
    neighbourhood = tags.get("addr:neighbourhood") or tags.get("addr:quarter")
    block = tags.get("addr:block_number")
    house = tags.get("addr:housenumber")
    if not (neighbourhood and block and house):
        return None
    city = tags.get("addr:city") or "千代田区"
    province = tags.get("addr:province") or "東京都"
    address = f"{province}{city}{neighbourhood}{block}-{house}"
    housename = tags.get("addr:housename")
    if housename:
        address = f"{address} {housename}"
    return address


def extract_cuisine(tags):
    raw = tags.get("cuisine", "")
    values = []
    for part in re.split(r"[;,]", raw):
        part = part.strip().lower()
        if not part:
            continue
        mapped = CUISINE_SYNONYMS.get(part, part)
        if mapped:  # synonyms may map to "" to drop a useless value
            values.append(mapped)
    if not values:
        fallback = AMENITY_FALLBACK_CUISINE.get(tags.get("amenity"))
        if fallback:
            values.append(fallback)
    # de-dupe, keep order
    seen = set()
    out = []
    for v in values:
        if v not in seen:
            seen.add(v)
            out.append(v)
    return out


# Japanese shop-type nouns, so descriptions read as Japanese rather than as
# raw OSM keys. Each value must work directly after "秋葉原エリアの".
CUISINE_SHOP_LABELS = {
    "ramen": "ラーメン店",
    "cafe": "カフェ",
    "izakaya": "居酒屋",
    "bar": "バー",
    "japanese": "和食店",
    "noodle": "麺類店",
    "curry": "カレー店",
    "chinese": "中華料理店",
    "sushi": "寿司店",
    "italian": "イタリアン",
    "barbecue": "焼肉店",
    "yakiniku": "焼肉店",
    "indian": "インド料理店",
    "soba": "そば店",
    "udon": "うどん店",
    "burger": "ハンバーガー店",
    "kebab": "ケバブ店",
    "beef_bowl": "牛丼店",
    "sweets": "スイーツ店",
    "french": "フレンチ",
    "korean": "韓国料理店",
    "thai": "タイ料理店",
    "vietnamese": "ベトナム料理店",
    "mexican": "メキシコ料理店",
    "spanish": "スペイン料理店",
    "american": "アメリカン料理店",
    "asian": "アジア料理店",
    "pizza": "ピザ店",
    "steak": "ステーキ店",
    "seafood": "海鮮料理店",
    "fish": "魚料理店",
    "tonkatsu": "とんかつ店",
    "tempura": "天ぷら店",
    "donburi": "丼もの店",
    "gyoza": "餃子店",
    "okonomiyaki": "お好み焼き店",
    "yakisoba": "焼きそば店",
    "shabu_shabu": "しゃぶしゃぶ店",
    "sukiyaki": "すき焼き店",
    "unagi": "うなぎ店",
    "oden": "おでん店",
    "teppanyaki": "鉄板焼き店",
    "hot_pot": "鍋料理店",
    "sandwich": "サンドイッチ店",
    "bubble_tea": "タピオカ店",
    "crepe": "クレープ店",
    "international": "各国料理店",
    "regional": "郷土料理店",
}

AMENITY_SHOP_LABELS = {
    "restaurant": "飲食店",
    "cafe": "カフェ",
    "fast_food": "ファストフード店",
    "bar": "バー",
    "pub": "パブ・居酒屋",
    "ice_cream": "アイスクリーム店",
}

# "japanese" on its own says very little; prefer a more specific cuisine when
# the place carries both (はなまるうどん is tagged japanese;udon).
GENERIC_CUISINE = {"japanese", "asian", "international", "regional", "local"}


def build_description(tags, cuisine):
    """Deliberately factual and short. These never become a page on their own,
    so this only has to read well in a list."""
    specific = [c for c in cuisine if c not in GENERIC_CUISINE]
    for candidate in specific + cuisine:
        label = CUISINE_SHOP_LABELS.get(candidate)
        if label:
            return f"秋葉原エリアの{label}"
    fallback = AMENITY_SHOP_LABELS.get(tags.get("amenity"), "飲食店")
    return f"秋葉原エリアの{fallback}"


def main():
    write = "--write" in sys.argv

    if not RAW_FILE.exists():
        raise SystemExit(
            f"FATAL: {RAW_FILE.relative_to(REPO_ROOT)} not found. "
            "Run scripts/fetch-osm-gourmet.py first."
        )

    spots = json.loads(SPOTS_JSON.read_text(encoding="utf-8"))
    raw = json.loads(RAW_FILE.read_text(encoding="utf-8"))
    elements = raw["elements"]

    existing_names = {}
    for spot in spots:
        for name in [spot["name"]] + spot.get("aliases", []):
            existing_names.setdefault(normalise_name(name), spot)

    existing_osm_ids = {s.get("osmId") for s in spots if s.get("osmId")}
    existing_slugs = {s["slug"] for s in spots}
    next_id = max(s["id"] for s in spots) + 1

    new_spots = []
    skipped_existing = []
    skipped_no_coords = []
    needs_review = []

    for el in elements:
        tags = el["tags"]
        name = tags["name"]
        osm_id = f"{el['type']}/{el['id']}"

        if osm_id in existing_osm_ids:
            skipped_existing.append((name, "already imported"))
            continue

        lat, lng = element_coords(el)
        if lat is None:
            skipped_no_coords.append(name)
            continue

        norm = normalise_name(name)

        match = existing_names.get(norm)
        review_note = None
        if match is None:
            # One name contains the other. Only the same place if they are
            # nearly co-located, or if we have no coordinates to judge by.
            for cand_norm, cand in existing_names.items():
                if len(cand_norm) < 3:
                    continue
                if cand_norm not in norm and norm not in cand_norm:
                    continue
                if cand.get("lat") is None or cand.get("lng") is None:
                    match = cand
                    break
                gap = distance_metres(lat, lng, cand["lat"], cand["lng"])
                if gap <= SAME_PLACE_METRES:
                    match = cand
                    break
                if gap <= REVIEW_METRES and review_note is None:
                    review_note = (name, cand["slug"], round(gap))

        if match is not None:
            skipped_existing.append((name, f"matches {match['slug']}"))
            continue

        if review_note:
            needs_review.append(review_note)

        slug = f"osm-{el['type']}-{el['id']}"
        if slug in existing_slugs:
            skipped_existing.append((name, "slug collision"))
            continue
        existing_slugs.add(slug)

        cuisine = extract_cuisine(tags)
        spot = {
            "id": next_id,
            "name": name,
            "slug": slug,
            "category": "グルメ・カフェ",
            "description": build_description(tags, cuisine),
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "tier": "B",
            "dataSource": "osm",
            "osmId": osm_id,
        }
        next_id += 1

        address = compose_address(tags)
        if address:
            spot["address"] = address
        hours = tags.get("opening_hours")
        if hours:
            spot["hours"] = hours
        website = tags.get("website") or tags.get("contact:website")
        if website and website.startswith("http"):
            spot["website"] = website
        if cuisine:
            spot["cuisine"] = cuisine

        new_spots.append(spot)

    print(f"OSM elements:        {len(elements)}")
    print(f"  already covered:   {len(skipped_existing)}")
    print(f"  missing coords:    {len(skipped_no_coords)}")
    print(f"  new tier B spots:  {len(new_spots)}")
    print()
    print(f"  with address:      {sum(1 for s in new_spots if s.get('address'))}")
    print(f"  with hours:        {sum(1 for s in new_spots if s.get('hours'))}")
    print(f"  with website:      {sum(1 for s in new_spots if s.get('website'))}")
    print(f"  with cuisine:      {sum(1 for s in new_spots if s.get('cuisine'))}")
    print()

    cuisine_counts = Counter(c for s in new_spots for c in s.get("cuisine", []))
    print("  top cuisine:", dict(cuisine_counts.most_common(15)))
    print()

    if skipped_existing:
        print("  skipped as already covered:")
        for name, why in skipped_existing:
            print(f"    - {name} ({why})")
        print()

    if needs_review:
        print("  imported, but sits near a similarly-named existing spot —")
        print("  check whether these are the same place:")
        for name, slug, gap in needs_review:
            print(f"    - {name} ~ {slug} ({gap}m)")
        print()

    if not write:
        print("Dry run. Re-run with --write to apply, then: pnpm validate:spots")
        return 0

    spots.extend(new_spots)
    SPOTS_JSON.write_text(
        json.dumps(spots, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {len(new_spots)} new spots to data/spots.json (total {len(spots)}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
