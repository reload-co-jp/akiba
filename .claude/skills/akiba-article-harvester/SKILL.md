---
name: akiba-article-harvester
description: >
  Use this skill when asked to find, collect, or add new Akihabara-related
  articles by checking recurring source sites for events, campaigns,
  collaborations, pop-ups, store openings, closures, local news, and notable
  happenings in or around Akihabara, including "秋葉原で起こった出来事". It
  prioritizes bulk harvesting: collect many candidates, remove duplicates against
  `data/articles.json`, confirm facts, then add as many non-duplicate articles
  as can be safely verified in one pass.
metadata:
  short-description: 秋葉原記事候補を重複除外し一括記事化する
---

# Akiba Article Harvester

Find new Akihabara article candidates from a fixed set of sources, avoid duplicates, then create as many verified article entries as practical using the repo's article format. Candidates include events and non-event "秋葉原で起こった出来事" such as shop openings, renewals, closures, campaigns, notable product/store launches, area changes, local services, incidents, public notices, announcements, and culture/news items tied clearly to Akihabara.

Use this skill before `$event-article-writer` when the user asks to "秋葉原の記事を作成", "秋葉原で起こった出来事を拾う", "秋葉原ニュースを拾う", "イベントを拾う", "新規記事候補を探す", "巡回して追加", or provides one of the source-list pages instead of a specific event page.

## Quick Start

1. Read [references/source-list.md](references/source-list.md).
2. Browse sources with `scripts/harvest.py` (see [Harvest Script](#harvest-script) below), not WebFetch — WebFetch in this environment gets redirected/throttled by the context-mode MCP plugin and burns several tool calls before failing. `python3 .claude/skills/akiba-article-harvester/scripts/harvest.py list all` covers every primary/aggregator source in one pass. Still run X.com live search and news/discovery sources separately (the script doesn't cover those) for broad harvesting.
3. Build a candidate queue before writing. Aim for as many solid candidates as possible; do not cap the batch at 5-10 when more verified candidates are available. Stop only when sources are exhausted or verification is blocked.
4. Extract candidate items that clearly relate to Akihabara, nearby Kanda/Ochanomizu/Iwamotocho when relevant, or venues already covered by the site. Include both event items and non-event local happenings / "秋葉原で起こった出来事".
5. Deduplicate the whole queue with `python3 scripts/harvest.py dedup "<keyword|url>" ...` (see [Duplicate Check](#duplicate-check)) before drafting new articles — do this BEFORE deep fact-checking, since most rejections happen here.
6. For each remaining candidate, confirm facts with `python3 scripts/harvest.py detail "<url>"`: date or announcement timing, location, operator/organizer, price or user impact when applicable, reservation/ticket rules when applicable, and image. Keep every source page used to find or confirm the candidate.
7. Add all verified non-duplicate articles in one edit batch following `$event-article-writer` rules. Include official/reference links in `sources` so the article detail page can render them. Set `authorId` to `1` on every new article, then verify once with `pnpm build`.

### Avoiding the ls-noise hook

A PreToolUse hook in this environment prepends a full directory listing to raw Bash stdout, which burns context fast across many harvest calls. Always redirect script output to a temp file and read it back with the Read tool instead of letting it print directly:

```
python3 .claude/skills/akiba-article-harvester/scripts/harvest.py list all > /tmp/harvest_out.txt 2>&1
```
Then `Read` `/tmp/harvest_out.txt`. This applies to every `harvest.py` invocation below.

### DNS / Network Failures

Article sources often fail inside agent sandboxes with temporary DNS or network errors. The harvest script retries transient failures automatically (3 attempts with backoff). When output contains `FETCH FAILED after retries` or DNS messages such as `Temporary failure in name resolution`, rerun the exact same `harvest.py` command with escalated network permissions instead of switching to manual one-off fetching.

Use the same rule for images: prefer `curl -L --retry 3 --retry-delay 2 --connect-timeout 10 "<image-url>" -o public/images/articles/<slug>.<ext>`. If `curl` fails with DNS/network sandbox errors, rerun the exact command with escalated network permissions.

## Harvest Script

`scripts/harvest.py` bakes in the source-specific parsing fixes found in past runs (wrong href shapes, titles hidden in `title=""` attributes instead of link text, stale archived listings, etc — see comments in the script). Three subcommands:

- `list <source|all>` — candidate `(title, url)` pairs for one source name from `references/source-list.md` (`atre`, `shosen`, `prtimes`, `walkerplus`, `collabocafe`, `gamers`, `enjoytokyo`, `akibapc_info`, `akibapc_event`, `animate`, `amiami_realstore`, `kotobukiya`, `mogra`, `akihabara_zest`, `akihabara_galaxy`, `club_goodman`, `gnews`, `ceek`), or `all`.
- `detail <url>...` — fetches one or more detail pages and prints `TITLE` / `OGIMG` / `OGDESC` / `FACTS` (date, venue, price, reservation lines). Use this for step 6 instead of WebFetch. Prints a warning if the page mentions 神保町/グランデ (the shosen Jimbocho store — out of Akihabara scope).
- `dedup <candidate>...` — see Duplicate Check below.

If a source's HTML structure changes and extraction breaks, fix the relevant entry in `SOURCES` (or the `gnews`/`ceek` branches) in the script directly rather than reverting to ad-hoc regex in the conversation — keeping the fix in the script means the next run benefits too.

## X.com Discovery

- Include X.com live search in every broad harvesting pass, using the source-list URL and keyword variants such as `秋葉原 イベント`, `秋葉原 コラボ`, `秋葉原 ポップアップ`, `秋葉原 オープン`, `秋葉原 閉店`, `秋葉原 ニュース`, `秋葉原 出来事`, `秋葉原 話題`, `アキバ イベント`, `AKIHABARA POP UP`, and venue names.
- Treat X.com as discovery or supporting evidence only. Do not create an article from an unverified tweet alone.
- Prefer posts from official venue, shop, organizer, publisher, label, or brand accounts. Drop posts from fan accounts, repost aggregators, or anonymous accounts unless they link to an official page.
- When X reveals a candidate, search the exact event title, account name, venue, date, and linked domain to find a primary source. Write only after confirming date, venue, price or admission, reservation or ticket rules, and usable image from official/primary sources.
- Record an X.com source only when the official account post confirms a fact that is not fully covered elsewhere, or when it is the discovery source and the article also has a primary confirmation source.
- If X.com blocks browsing or login is unavailable, fall back to web search queries targeting `x.com` and official sites, then report X.com as blocked only if no usable view or search result is available.

## Bulk Harvesting Bias

- Default behavior is "maximize safe additions": add every candidate that is in scope, non-duplicate, and fact-confirmed. When many candidates are available, process them all in one pass — do not defer to a later run.
- Do not ask the user to pick from candidates unless there are too many low-confidence options or the sources conflict.
- Favor candidates with complete facts and usable images. Skip uncertain candidates rather than slowing the batch.
- When time or source quality forces a limit, prioritize near-future events, official/primary sources, clear Akihabara venues, and distinct article variety.
- Make one JSON edit batch for all selected candidates, save all images, then run one build.

## Candidate Rules

Include:
- Events, fairs, pop-ups, collaborations, campaigns, exhibits, performances, signings, workshops, and other scheduled visitor-facing activities.
- Non-event Akihabara happenings / 秋葉原で起こった出来事: store openings, reopenings, renewals, relocations, closures, service launches, notable local product launches, local campaigns, building or area changes, facility updates, public notices, incidents with clear public impact, culture/news items, and other local changes with clear reader value.
- Items happening in or materially affecting Akihabara proper, around Akihabara Station, Suehirocho, Kanda, Awajicho/Ochanomizu, Iwamotocho, or Akihabara-adjacent venues used by existing articles.
- Online reservation, ticket, preorder, or application pages only when the physical venue, store, pickup point, or local action is in scope.

Exclude:
- Generic national campaigns with no specific Akihabara venue.
- Pure press releases with no local action, local venue/store, local impact, or Akihabara-specific reader value.
- Crime, accident, or emergency items whose only value is sensational detail; include only when there is clear local public impact such as closures, access restrictions, safety notices, or major service changes.
- Items already covered in `data/articles.json`.
- Items with missing core facts when no reliable source can confirm them. For events, date and venue are required. For non-events, announcement/opening/effective date, location or affected Akihabara entity, and concrete user impact are required.

## Duplicate Check

**Title-keyword search alone under-detects duplicates.** This repo's articles are usually titled formally/officially (e.g. `「オタクに優しいギャルはいない!?」POP UP SHOPがボークス秋葉原ホビー天国2で開催`), while aggregators use colloquial nicknames (e.g. collabocafe's `オタギャル`). A plain `rg` for the colloquial keyword finds nothing even though the event was already added last run. Discovering this cost most of a harvesting session once — don't re-learn it.

Before writing, for every candidate in the queue, run one batched check (not one `rg` call per keyword):

```
python3 .claude/skills/akiba-article-harvester/scripts/harvest.py dedup \
  "<keyword1>|<source-url-1>" "<keyword2>|<source-url-2>" ... > /tmp/dedup_out.txt 2>&1
```

Then `Read` `/tmp/dedup_out.txt`. This checks three things at once per candidate:
1. Japanese keyword as a substring of existing `title`/`summary`/`content`.
2. Romanized tokens pulled from the candidate's own source URL (aggregator URLs already carry an English slug hint, e.g. `.../otagal-animal-butler-and-maid-popup-store-akihabara2026/`) against existing article `slug`s.
3. The same tokens against filenames already saved under `public/images/articles/` — images can exist for an article you haven't otherwise matched yet.

A match is a heuristic signal, not proof — open the existing article and compare dates/venue before concluding it's a true duplicate (multi-run franchises legitimately get a new pop-up every few months at the same venue).

Additional checks:
- Compare source URLs and event IDs such as WalkerPlus `/event/ar0313e.../`, LivePocket `/e/...`, Atre `/news/...`.
- If same event exists, do not create another article. Add any newly found source URL to the existing article's `sources` array when it is not already present, then report the duplicate. Only update article facts/content when the user asked for refresh.
- When harvesting many items, maintain a temporary duplicate ledger: `new`, `duplicate`, `hold`. Only `new` candidates are written as articles.
- Run the dedup batch a second time right before final edits with the full selected list, to catch late duplicates revealed mid-session.

## Source Recording

- Every article created through this skill must keep discovery and confirmation sources in `sources`.
- Save all source pages actually used: source-list/discovery page, aggregator page, primary/official page, ticket page, venue page, press release, and official SNS page when it confirms facts.
- If an official URL, reference URL, ticket URL, venue URL, or official SNS URL exists, add it to `sources`; the site renders these as article links under `公式URL・参考URL`.
- Always try to find a primary/official URL when the candidate comes from an aggregator. Do not rely on aggregator-only sources unless no official page can be found after searching the exact event title, venue, organizer, and date.
- When `image.sourceUrl` points to an official/reference page that is not already in `sources`, add the same URL to `sources` too.
- Prefer putting primary/official sources first, then ticket/venue pages, then aggregators/discovery pages.
- When the same event is found from multiple sources, keep multiple entries in `sources`; do not replace the earlier source.
- Deduplicate sources by normalized URL. Ignore trailing slashes, tracking parameters, and obvious mobile/desktop variants.
- Use clear labels such as `公式サイト`, `公式ニュース`, `TIGET イベントページ`, `アトレ秋葉原 公式ニュース`, `店舗公式ブログ`, `PR TIMES プレスリリース`, or `Collabo Cafe 記事`.

## Source Priority

Prefer primary or official sources over aggregators:

1. Official event/campaign page, venue page, shop page, ticket page, official store/company announcement, or public notice.
2. Official SNS or official press release.
3. Aggregators such as WalkerPlus, Enjoy Tokyo, Collabo Cafe, PR TIMES, only when they clearly attribute details.

When an aggregator reveals an event but not enough facts, search the exact event title and venue to find a primary source.

### Per-source gotchas (already baked into `scripts/harvest.py`, but matters when reading its output)

- **shosen**: the `/event/` listing mixes 書泉ブックタワー (Akihabara, in scope) and 書泉グランデ (Jimbocho, out of scope) — the listing page doesn't say which. Always run `harvest.py detail` on the event URL and check for the 神保町/グランデ warning before writing.
- **gamers**: `event_fair/list.php` mixes current fairs (detail `id` roughly 7000+) with years-old archived ones (`id` in the low hundreds). Always confirm the actual 開催期間 on the detail page is current/future before treating it as a candidate.
- **collabocafe**: the `/events/tag/akihabara/` page includes non-Akihabara legs of multi-city tours (Osaka, Nagoya, Shinjuku, Ikebukuro, etc). Confirm the Akihabara venue explicitly in the detail page's `OGDESC`/`FACTS` before writing — don't assume every item tagged "akihabara" is actually there.
- **walkerplus / enjoytokyo**: area-filtered listings are noisy — many results are Tokyo-wide, not Akihabara-specific. Treat as low-precision; verify venue text explicitly before including.
- **AKIBA PC Hotline!**: high-value discovery but often aggregates several small items in one article. Split into separate articles only when each item has enough facts and clear reader value; otherwise use as a supporting discovery/source.
- **live house schedules**: include normal live events too, not only anime/game-adjacent ones, as long as the venue is in scope and date, price, performers, and visitor-facing details are clear.

## Output When Harvesting

If the user asks to add articles, implement them directly.

If many candidates are found, keep the response compact:
- `追加`: slugs created
- `重複`: existing slugs or titles
- `保留`: reason, such as missing source, unclear venue, or no image
- `確認`: `pnpm build` result

Do not list every discovered candidate when many were rejected. Report only useful outcomes: added, duplicate, held, and verification.

## Writing Handoff

For each selected candidate, follow `$event-article-writer`:
- Use `data/articles.json` schema.
- Save article images under `public/images/articles/`.
- Use placeholder handling only when no usable image exists.
- Add official/reference source URLs in `sources`.
- Include `en` field with English translations of `title`, `summary`, and `content`.
- Set `authorId: 1` on every new article.
- Add `event` data only when the article is a dated event, campaign, opening, closure, or other item that should appear on `/events`. For ordinary news without a useful event-style date/location, omit `event`.
- Update map coordinates in `components/events-map.tsx` when the venue/location should appear on `/events`.
- Run `pnpm build` after edits.
