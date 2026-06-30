#!/usr/bin/env python3
"""
Akiba article harvester helper.

Why this exists: page-fetching tools in agent environments are often slow,
throttled, or summarized before the raw HTML is usable, and naive regex
against listing pages breaks silently (wrong href shape, title hidden in
nested tags, stale dates). This script bakes in the fixes found the hard way
so each harvest run doesn't re-derive them.

Usage:
  python3 harvest.py list <source|all>      # candidate (title, url) pairs
  python3 harvest.py detail <url>           # TITLE/OGIMG/OGDESC/FACTS for one page
  python3 harvest.py dedup "<kw1>" "<kw2>"   # check candidates against existing data

For large output, redirect to a file and read the file back rather than
letting it print directly into the conversation, e.g.:
  python3 harvest.py list all > /tmp/harvest_out.txt 2>&1
"""
import html
import json
import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
REPO_ROOT = Path(__file__).resolve().parents[4]
ARTICLES_JSON = REPO_ROOT / "data" / "articles.json"
IMAGES_DIR = REPO_ROOT / "public" / "images" / "articles"


def is_transient_network_error(exc):
    if isinstance(exc, (socket.gaierror, TimeoutError, urllib.error.URLError)):
        return True
    msg = str(exc).lower()
    return any(
        marker in msg
        for marker in [
            "temporary failure in name resolution",
            "nodename nor servname provided",
            "name or service not known",
            "timed out",
            "network is unreachable",
        ]
    )


def fetch(url, timeout=20, retries=3, retry_delay=2):
    req = urllib.request.Request(url, headers=UA)
    last_error = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read().decode("utf-8", errors="ignore")
        except Exception as exc:
            last_error = exc
            if attempt >= retries or not is_transient_network_error(exc):
                break
            print(
                f"FETCH RETRY {attempt}/{retries}: {url} ({type(exc).__name__}: {exc})",
                file=sys.stderr,
            )
            time.sleep(retry_delay * attempt)
    print(
        "FETCH FAILED after retries. If this is DNS/network sandboxing, rerun the same "
        f"harvest.py command with escalated network permissions. URL: {url}",
        file=sys.stderr,
    )
    raise last_error


def dec(s):
    return html.unescape(s)


def trunc(s, n):
    s = s.strip()
    return s[:n] + "..." if len(s) > n else s


class LinkExtractor(HTMLParser):
    """Collects (href, text-or-title-attr) for <a> tags matching href_filter."""

    def __init__(self, href_filter):
        super().__init__()
        self.href_filter = href_filter
        self.items = []
        self.cur_href = None
        self.cur_text = []
        self.cur_has_title_attr = False
        self.depth = 0

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "a":
            href = d.get("href", "")
            if self.href_filter(href):
                self.cur_href = href
                # many sites (shosen) put the real title in title="", not inner text
                self.cur_has_title_attr = bool(d.get("title"))
                self.cur_text = [d["title"]] if self.cur_has_title_attr else []
                self.depth = 1
            elif self.cur_href is not None:
                self.depth += 1
        elif tag == "img" and self.cur_href is not None:
            alt = d.get("alt")
            if alt:
                self.cur_text.append(alt)

    def handle_endtag(self, tag):
        if tag == "a" and self.cur_href is not None:
            self.depth -= 1
            if self.depth <= 0:
                text = " ".join(t.strip() for t in self.cur_text if t.strip())
                self.items.append((self.cur_href, text))
                self.cur_href = None
                self.cur_has_title_attr = False

    def handle_data(self, data):
        if self.cur_href is not None and not self.cur_has_title_attr:
            t = data.strip()
            if t:
                self.cur_text.append(t)


def extract(url, href_filter, base=""):
    text = fetch(url)
    p = LinkExtractor(href_filter)
    p.feed(text)
    out_by_url = {}
    for href, t in p.items:
        full = href if href.startswith("http") else base + href
        title = dec(t)
        if full not in out_by_url or (not out_by_url[full] and title):
            out_by_url[full] = title
    return [(t, href) for href, t in out_by_url.items()]


# --- per-source extraction -------------------------------------------------
# Gotchas baked in here (each cost a debugging round the first time):
#   - atre / shosen hrefs on the live site are ABSOLUTE URLs, not "/path"-relative.
#     A leading-^ relative-path regex silently matches zero links.
#   - shosen's visible title text is NOT inside the <a> ... it's the title="" attribute.
#   - prtimes listing text is wrapped in nested spans; pull the <title> from each
#     press-release page instead of the listing page.
#   - gamers.co.jp's "fair list" mixes CURRENT fairs (detail id ~7000+) with
#     YEARS-OLD archived ones (id < 300). Always check the actual 開催期間 on the
#     detail page before treating a gamers item as a live candidate.
#   - shosen events can be at 書泉ブックタワー (Akihabara) OR 書泉グランデ (Jimbocho).
#     The listing page doesn't say which — check the detail page body for
#     "神保町" / "グランデ" and exclude those.
#   - collabocafe's "/events/tag/akihabara/" page includes non-Akihabara legs of
#     multi-city tours (Osaka, Nagoya, Shinjuku, etc). Confirm the Akihabara venue
#     in the detail page's og:description before writing an article.
#   - walkerplus / enjoytokyo area listings are noisy: many results are
#     Tokyo-wide, not Akihabara-specific, despite the area filter. Treat as
#     low-precision; verify venue text explicitly.

SOURCES = {
    "atre": dict(
        url="https://www.atre.co.jp/akihabara/news/",
        href_filter=lambda h: bool(re.search(r"/akihabara/news/\d+$", h or "")),
        base="",
    ),
    "shosen": dict(
        url="https://www.shosen.co.jp/event/",
        href_filter=lambda h: bool(re.search(r"/event/\d+/?$", h or "")),
        base="",
    ),
    "prtimes": dict(
        url="https://prtimes.jp/topics/keywords/%E7%A7%8B%E8%91%89%E5%8E%9F",
        href_filter=lambda h: bool(re.match(r"^/main/html/rd/p/", h or "")),
        base="https://prtimes.jp",
    ),
    "walkerplus": dict(
        url="https://www.walkerplus.com/event_list/ar0313/sc309922d/",
        href_filter=lambda h: bool(re.match(r"^/event/[a-z0-9]+/$", h or "")),
        base="https://www.walkerplus.com",
    ),
    "collabocafe": dict(
        url="https://collabo-cafe.com/events/tag/akihabara/",
        href_filter=lambda h: "/events/collabo/" in (h or ""),
        base="",
    ),
    "gamers": dict(
        url="https://www.gamers.co.jp/contents/event_fair/list.php?lmode=fair&category=0&keyword=AKIHABARA",
        href_filter=lambda h: "event_fair" in (h or "") and "detail.php" in (h or ""),
        base="https://www.gamers.co.jp/contents/event_fair/",
    ),
    "enjoytokyo": dict(
        url="https://www.enjoytokyo.jp/event/list/area1319/",
        href_filter=lambda h: bool(re.search(r"/event/\d{6,7}/$", h or "")),
        base="",
    ),
    "akibapc_info": dict(
        url="https://akiba-pc.watch.impress.co.jp/category/info/",
        href_filter=lambda h: bool(re.search(r"/docs/news/news/\d+\.html$", h or "")),
        base="https://akiba-pc.watch.impress.co.jp",
    ),
    "akibapc_event": dict(
        url="https://akiba-pc.watch.impress.co.jp/category/event/",
        href_filter=lambda h: bool(re.search(r"/docs/news/news/\d+\.html$", h or "")),
        base="https://akiba-pc.watch.impress.co.jp",
    ),
    "animate": dict(
        url="https://www.animate-onlineshop.jp/contents/fair_event/",
        href_filter=lambda h: "detail.php?id=" in (h or ""),
        base="https://www.animate-onlineshop.jp/contents/fair_event/",
    ),
    "amiami_realstore": dict(
        url="https://realstore.amiami.jp/event/",
        href_filter=lambda h: bool(re.search(r"/event/[^\"#]+\.html?$", h or "")),
        base="https://realstore.amiami.jp",
    ),
    "kotobukiya": dict(
        url="https://www.kotobukiya.co.jp/event/",
        href_filter=lambda h: bool(re.search(r"/event/[^\"#]+/?$", h or "")) and h != "/event/",
        base="https://www.kotobukiya.co.jp",
    ),
    "mogra": dict(
        url="https://club-mogra.jp/event/",
        href_filter=lambda h: bool(re.search(r"/20\d{2}/\d{2}/\d{2}/", h or "")),
        base="https://club-mogra.jp",
    ),
    "akihabara_zest": dict(
        url="https://akihabara-zest.com/schedule/",
        href_filter=lambda h: bool(re.search(r"/schedule/[^\"#]+/?$", h or "")),
        base="https://akihabara-zest.com",
    ),
    "akihabara_galaxy": dict(
        url="https://akihabara-galaxy.com/schedule/",
        href_filter=lambda h: bool(re.search(r"/schedule/[^\"#]+/?$", h or "")),
        base="https://akihabara-galaxy.com",
    ),
    "club_goodman": dict(
        url="https://goodman2020.com/schedule/",
        href_filter=lambda h: bool(re.search(r"/events?/", h or "") or re.search(r"/schedule/[^\"#]+/?$", h or "")),
        base="https://goodman2020.com",
    ),
}


def list_source(name, limit=80):
    if name == "gnews":
        text = fetch(
            "https://news.google.com/rss/search?q=%E7%A7%8B%E8%91%89%E5%8E%9F&hl=ja&gl=JP&ceid=JP:ja"
        )
        items = re.findall(r"<item>(.*?)</item>", text, re.S)
        print(f"\n=== gnews ({len(items)}) ===")
        for it in items[:limit]:
            title = dec(re.search(r"<title>(.*?)</title>", it, re.S).group(1))
            link = re.search(r"<link>(.*?)</link>", it, re.S).group(1)
            pub = re.search(r"<pubDate>(.*?)</pubDate>", it, re.S)
            pub = pub.group(1)[:16] if pub else ""
            print(f"{pub} | {trunc(title, 80)} | {link[:70]}")
        return
    if name == "ceek":
        text = fetch("https://news.ceek.jp/search.cgi?q=%E7%A7%8B%E8%91%89%E5%8E%9F&summary=1")
        items = extract(
            "https://news.ceek.jp/search.cgi?q=%E7%A7%8B%E8%91%89%E5%8E%9F&summary=1",
            lambda h: h and h.startswith("http") and "ceek.jp" not in h,
        )
        print(f"\n=== ceek ({len(items)}) ===")
        for t, href in items[:limit]:
            print(f"{trunc(t, 70)} | {href}")
        return
    cfg = SOURCES[name]
    items = extract(cfg["url"], cfg["href_filter"], cfg["base"])
    print(f"\n=== {name} ({len(items)}) ===")
    for t, href in items[:limit]:
        print(f"{trunc(t, 70)} | {href}")


def cmd_list(args):
    target = args[0] if args else "all"
    if target == "all":
        for name in list(SOURCES) + ["gnews", "ceek"]:
            try:
                list_source(name)
            except Exception as e:
                print(f"\n=== {name} ERROR: {e}")
    else:
        list_source(target, limit=200)


def cmd_detail(args):
    """Fetch one detail page and print TITLE/OGIMG/OGDESC/FACTS — use before
    writing any article to confirm venue, dates, price, reservation rules."""
    for url in args:
        try:
            text = fetch(url)
            print(f"\n=== {url} ===")
            title = re.search(r"<title>(.*?)</title>", text, re.S)
            print("TITLE:", dec(title.group(1)).strip() if title else "")
            ogimg = re.search(r'<meta property="og:image" content="([^"]+)"', text)
            print("OGIMG:", ogimg.group(1) if ogimg else "")
            ogdesc = re.search(r'<meta property="og:description" content="([^"]+)"', text)
            print("OGDESC:", dec(ogdesc.group(1))[:300] if ogdesc else "")
            body = re.sub(r"<script[\s\S]*?</script>", " ", text)
            body = re.sub(r"<style[\s\S]*?</style>", " ", body)
            plain = dec(re.sub(r"<[^>]+>", "\n", body))
            lines = [l.strip() for l in plain.split("\n") if l.strip()]
            keep = [
                l
                for l in lines
                if re.search(r"\d{1,2}月\d{1,2}日|\d{4}年|期間|会場|住所|店舗|価格|円|予約|無料|有料|時間|開催|神保町|グランデ", l)
            ]
            print("FACTS:", " | ".join(keep[:30]))
            if any("神保町" in l or "グランデ" in l for l in keep):
                print("WARNING: page mentions 神保町/グランデ — confirm this is NOT the Jimbocho store before writing.")
        except Exception as e:
            print(f"\n=== {url} ERROR: {e}")


GENERIC_SLUG_TOKENS = {
    "popup", "pop", "store", "shop", "shops", "akihabara", "akiba", "tokyo", "japan",
    "event", "events", "collabo", "collaboration", "fair", "cafe", "campaign",
    "exhibition", "exhibit", "anime", "anniversary", "tour", "festival", "the",
}


def slug_tokens(url_or_slug):
    """Pull distinctive lowercase tokens out of a URL path or slug. Aggregator
    URLs (collabocafe, gamers, ...) already carry a romanized hint of the title
    — e.g. .../otagal-animal-butler-and-maid-popup-store-akihabara2026/ — which
    is the only practical way to cross-check a Japanese aggregator title against
    this repo's English article slugs without doing real translation."""
    s = re.sub(r"^https?://[^/]+", "", url_or_slug)
    s = re.sub(r"\.(html?|jpe?g|png|php.*)$", "", s)
    s = re.sub(r"\d+$", "", s)  # trailing year, e.g. ...2026
    parts = re.split(r"[/_\-?=&]+", s)
    out = []
    for p in parts:
        p = p.lower()
        if len(p) >= 4 and p.isalpha() and p not in GENERIC_SLUG_TOKENS:
            out.append(p)
    return out


TRACKING_QUERY_PREFIXES = ("utm_",)
TRACKING_QUERY_KEYS = {
    "fbclid", "gclid", "yclid", "mc_cid", "mc_eid", "igshid", "ref", "ref_src",
    "spm", "feature", "si",
}


def normalize_source_url(url):
    """Normalize source/reference URLs for duplicate detection. This keeps
    source identity stable while ignoring tracking noise."""
    if not url:
        return ""
    parsed = urllib.parse.urlsplit(url.strip())
    scheme = parsed.scheme.lower() or "https"
    netloc = parsed.netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]
    path = re.sub(r"/+$", "", parsed.path) or "/"
    query_items = []
    for key, value in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True):
        key_l = key.lower()
        if key_l in TRACKING_QUERY_KEYS or any(key_l.startswith(p) for p in TRACKING_QUERY_PREFIXES):
            continue
        query_items.append((key_l, value))
    query = urllib.parse.urlencode(sorted(query_items))
    return urllib.parse.urlunsplit((scheme, netloc, path, query, ""))


def cmd_dedup(candidates):
    """Check candidates against existing articles. Each candidate is either:
      - a Japanese keyword/title fragment -> substring-matched against
        title/summary/content (works when the aggregator's wording matches
        this repo's wording — often does NOT, since this repo tends to use
        formal/official titles while aggregators use colloquial ones), or
      - a source URL (collabocafe/gamers/atre/...) -> first checked exactly
        against existing sources[].url and image.sourceUrl after URL
        normalization, then its path tokens are cross-checked against existing
        slugs AND image filenames under public/images/articles/. This catches
        both direct source reuse and the common case where a candidate looks
        "new" by title-keyword search alone but was already harvested under
        different Japanese wording in a prior pass.
      - "keyword|url" to run both checks for one candidate at once.
    Token matches are a heuristic, not proof — always open the existing
    article and compare dates/venue before concluding it's a true duplicate.
    """
    articles = json.loads(ARTICLES_JSON.read_text(encoding="utf-8"))
    existing_slugs = [a["slug"] for a in articles]
    image_stems = [p.stem for p in IMAGES_DIR.glob("*")] if IMAGES_DIR.exists() else []
    slug_to_article = {a["slug"]: a for a in articles}
    source_url_index = {}
    for a in articles:
        for src in a.get("sources", []) or []:
            norm = normalize_source_url(src.get("url", ""))
            if norm:
                source_url_index.setdefault(norm, {})[a["slug"]] = a
        img = a.get("image") or {}
        norm = normalize_source_url(img.get("sourceUrl", ""))
        if norm:
            source_url_index.setdefault(norm, {})[a["slug"]] = a

    for cand in candidates:
        kw, _, url = cand.partition("|")
        print(f"\n=== {cand} ===")
        found_any = False

        if kw and not kw.startswith("http"):
            text_hits = [
                (a["slug"], a["title"], a["publishedAt"])
                for a in articles
                if kw in a.get("title", "") or kw in a.get("summary", "") or kw in a.get("content", "")
            ]
            if text_hits:
                found_any = True
                print(f"  TEXT MATCH ({len(text_hits)}):")
                for slug, title, pub in text_hits[:5]:
                    print(f"    {slug} | {title} | {pub}")
        elif kw.startswith("http"):
            url = kw  # only one arg given and it's a URL

        target_url = url or (kw if kw.startswith("http") else "")
        if target_url:
            norm_target = normalize_source_url(target_url)
            source_hits = list(source_url_index.get(norm_target, {}).values())
            if source_hits:
                found_any = True
                print(f"  SOURCE URL MATCH ({norm_target}):")
                for a in source_hits[:5]:
                    print(f"    {a['slug']} | {a['title']} | {a['publishedAt']}")

            toks = slug_tokens(target_url)
            hits = set()
            for slug in existing_slugs + image_stems:
                slug_l = slug.lower()
                matched = [t for t in toks if t in slug_l]
                if matched:
                    hits.add(slug)
            if hits:
                found_any = True
                print(f"  SLUG/IMAGE TOKEN MATCH (tokens={toks}):")
                for slug in sorted(hits)[:5]:
                    a = slug_to_article.get(slug)
                    if a:
                        print(f"    {slug} | {a['title']} | {a['publishedAt']}")
                    else:
                        print(f"    {slug} (image file only, no matching article slug — check manually)")

        if not found_any:
            print("  NEW (no match found — still confirm facts before writing)")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    cmd, *args = sys.argv[1:]
    if cmd == "list":
        cmd_list(args)
    elif cmd == "detail":
        cmd_detail(args)
    elif cmd == "dedup":
        cmd_dedup(args)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
