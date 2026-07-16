#!/usr/bin/env python3
"""
Fast structural validation for data/articles.json — catches the mistakes that
`pnpm build` would also catch, without paying for a full Next.js build.

Run this after every edit to articles.json. Only run `pnpm build` afterwards
for a final check before finishing a batch (route generation, image imports,
etc still need the real build at least once).

Usage:
  python3 scripts/validate-articles.py
Exit code 0 = clean, 1 = problems found (see printed report).
"""
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
ARTICLES_JSON = REPO_ROOT / "data" / "articles.json"
TAGS_JSON = REPO_ROOT / "data" / "tags.json"
AUTHORS_JSON = REPO_ROOT / "data" / "authors.json"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "articles"

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
REQUIRED_STR_FIELDS = ["title", "slug", "summary", "content", "publishedAt"]


def fail(errors, msg):
    errors.append(msg)


def main():
    errors = []
    warnings = []

    try:
        raw = ARTICLES_JSON.read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"FATAL: {ARTICLES_JSON} not found")
        return 1

    try:
        articles = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"FATAL: invalid JSON syntax in {ARTICLES_JSON}")
        print(f"  {e.__class__.__name__}: {e.msg} at line {e.lineno}, column {e.colno}")
        context_lines = raw.splitlines()
        start = max(0, e.lineno - 3)
        end = min(len(context_lines), e.lineno + 2)
        for i in range(start, end):
            marker = ">> " if i == e.lineno - 1 else "   "
            print(f"  {marker}{i + 1}: {context_lines[i]}")
        return 1

    if not isinstance(articles, list):
        print(f"FATAL: {ARTICLES_JSON} top level must be a list, got {type(articles).__name__}")
        return 1

    tag_ids = set()
    if TAGS_JSON.exists():
        tag_ids = {t["id"] for t in json.loads(TAGS_JSON.read_text(encoding="utf-8"))}
    else:
        warnings.append(f"{TAGS_JSON} not found — skipping tagIds existence check")

    author_ids = set()
    if AUTHORS_JSON.exists():
        author_ids = {a["id"] for a in json.loads(AUTHORS_JSON.read_text(encoding="utf-8"))}
    else:
        warnings.append(f"{AUTHORS_JSON} not found — skipping authorId existence check")

    image_files = set()
    if IMAGES_DIR.exists():
        image_files = {p.name for p in IMAGES_DIR.iterdir() if p.is_file()}
    else:
        warnings.append(f"{IMAGES_DIR} not found — skipping image.src existence check")

    seen_ids = {}
    seen_slugs = {}

    for i, a in enumerate(articles):
        where = f"articles[{i}]"
        if not isinstance(a, dict):
            fail(errors, f"{where}: entry is not an object")
            continue

        aid = a.get("id")
        slug = a.get("slug", "<missing slug>")
        label = f"{where} (id={aid}, slug={slug})"

        if not isinstance(aid, int):
            fail(errors, f"{label}: id must be an integer, got {type(aid).__name__}")
        elif aid in seen_ids:
            fail(errors, f"{label}: duplicate id, already used by articles[{seen_ids[aid]}]")
        else:
            seen_ids[aid] = i

        if slug in seen_slugs:
            fail(errors, f"{label}: duplicate slug, already used by articles[{seen_slugs[slug]}]")
        else:
            seen_slugs[slug] = i
        if isinstance(slug, str) and slug != "<missing slug>":
            if slug != slug.lower():
                fail(errors, f"{label}: slug must be lowercase")
            if not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", slug):
                fail(errors, f"{label}: slug must be lowercase alphanumeric with hyphens only")

        for field in REQUIRED_STR_FIELDS:
            val = a.get(field)
            if not isinstance(val, str) or not val.strip():
                fail(errors, f"{label}: missing or empty required field '{field}'")

        if a.get("title", "").startswith("【秋葉原】"):
            fail(errors, f"{label}: title must NOT include the 【秋葉原】 prefix (added dynamically at render time)")

        pub = a.get("publishedAt")
        if isinstance(pub, str) and not DATE_RE.match(pub):
            fail(errors, f"{label}: publishedAt '{pub}' is not YYYY-MM-DD")

        tids = a.get("tagIds")
        if not isinstance(tids, list):
            fail(errors, f"{label}: missing or invalid tagIds (must be a list)")
        elif tag_ids:
            for tid in tids:
                if tid not in tag_ids:
                    fail(errors, f"{label}: tagIds contains unknown tag id {tid}")

        author_id = a.get("authorId")
        if author_id is not None and author_ids and author_id not in author_ids:
            fail(errors, f"{label}: authorId {author_id} not found in authors.json")

        en = a.get("en")
        if en is not None:
            if not isinstance(en, dict):
                fail(errors, f"{label}: en must be an object")
            else:
                for field in ["title", "summary", "content"]:
                    val = en.get(field)
                    if not isinstance(val, str) or not val.strip():
                        fail(errors, f"{label}: en.{field} missing or empty")

        image = a.get("image")
        if image is not None:
            if not isinstance(image, dict):
                fail(errors, f"{label}: image must be an object")
            else:
                src = image.get("src")
                if not isinstance(src, str) or not src:
                    fail(errors, f"{label}: image.src missing")
                else:
                    if not src.startswith("/images/articles/"):
                        fail(errors, f"{label}: image.src '{src}' should start with /images/articles/")
                    elif image_files:
                        fname = src.rsplit("/", 1)[-1]
                        if fname not in image_files:
                            fail(errors, f"{label}: image.src references '{fname}' but no such file under public/images/articles/")
                if not isinstance(image.get("alt"), str) or not image.get("alt", "").strip():
                    fail(errors, f"{label}: image.alt missing or empty")

        sources = a.get("sources")
        if sources is not None:
            if not isinstance(sources, list):
                fail(errors, f"{label}: sources must be a list")
            else:
                for j, s in enumerate(sources):
                    if not isinstance(s, dict) or not s.get("label"):
                        fail(errors, f"{label}: sources[{j}] missing 'label'")

        event = a.get("event")
        if event is not None:
            if not isinstance(event, dict):
                fail(errors, f"{label}: event must be an object")
            else:
                for field in ["venue", "startDate", "endDate", "price"]:
                    val = event.get(field)
                    if not isinstance(val, str) or not val.strip():
                        fail(errors, f"{label}: event.{field} missing or empty")
                for field in ["startDate", "endDate"]:
                    val = event.get(field)
                    if isinstance(val, str) and not DATE_RE.match(val):
                        fail(errors, f"{label}: event.{field} '{val}' is not YYYY-MM-DD")
                if "reservation" in event and not isinstance(event["reservation"], bool):
                    fail(errors, f"{label}: event.reservation must be a boolean")
                sd, ed = event.get("startDate"), event.get("endDate")
                if isinstance(sd, str) and isinstance(ed, str) and DATE_RE.match(sd) and DATE_RE.match(ed) and ed < sd:
                    fail(errors, f"{label}: event.endDate ({ed}) is before event.startDate ({sd})")

    print(f"Checked {len(articles)} articles.")
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
