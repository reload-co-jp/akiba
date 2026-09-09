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

Find new Akihabara article candidates from a fixed set of sources, dedupe, then create verified article entries. Candidates include events and non-event "秋葉原で起こった出来事": shop openings, renewals, closures, campaigns, notable product/store launches, area changes, local services, incidents, public notices, culture/news tied to Akihabara.

Use before `$event-article-writer` when asked "秋葉原の記事を作成", "秋葉原で起こった出来事を拾う", "秋葉原ニュースを拾う", "イベントを拾う", "新規記事候補を探す", "巡回して追加", or given a source-list page instead of a specific event page.

## Quick Start

1. Read [references/source-list.md](references/source-list.md).
2. Delegate to `web-scraper` agent (see [Scraping Delegation](#scraping-delegation)): run `scripts/harvest.py` (see [Harvest Script](#harvest-script)), not WebFetch — WebFetch here gets redirected/throttled by context-mode and burns tool calls before failing. `python3 .claude/skills/akiba-article-harvester/scripts/harvest.py list all` covers every primary/aggregator source in one pass. Run X.com live search and news/discovery sources separately — the script doesn't cover those.
3. Build a candidate queue. Maximize verified candidates; don't cap at 5-10. Stop only when sources are exhausted or verification is blocked.
4. Extract candidates clearly tied to Akihabara, adjacent Kanda/Ochanomizu/Iwamotocho, or venues the site already covers. Include both events and non-event local happenings.
5. Dedupe the whole queue with `harvest.py dedup "<keyword|url>" ...` (see [Duplicate Check](#duplicate-check)) BEFORE deep fact-checking — most rejections happen here. Always include the discovery/confirmation source URL so dedup can compare against `sources[].url`.
6. For each remaining candidate, delegate `harvest.py detail "<url>"` fetches to `web-scraper` (batch all URLs into one delegation): date/announcement timing, location, operator/organizer, price/user impact, reservation/ticket rules, image. Keep every source page used.
7. Add all verified non-duplicate articles in one edit batch per `$event-article-writer`. Include official/reference links in `sources`. Set `authorId: 1` on every new article. Run `pnpm run validate:articles`, fix anything reported, then `pnpm build` once.

## Scraping Delegation

Fetching/extraction run on the cheap `web-scraper` agent (Haiku) — raw listing/detail output never enters the main conversation, only structured candidate JSON.

Delegate:
- **Listing sweep** (step 2): one `Agent` call, `subagent_type: "web-scraper"`, `harvest.py list all` + X.com/news sources, returning each candidate as `{source_url, title, date_text}`.
- **Detail confirmation** (step 6): one `Agent` call with all remaining candidate URLs, returning date/venue/price/official URL/image URL/summary per URL.

Keep in main context (editorial/state-changing, not scraping): dedup + hold/reject decisions, `harvest.py exclude` logging, all `data/articles.json` edits, image placement, `validate:articles`, `pnpm build`.

Give the agent explicit URLs and exact fields wanted — it doesn't judge scope, duplicates, or article-worthiness.

### Avoiding the ls-noise hook

A PreToolUse hook here prepends a full directory listing to raw Bash stdout, burning context across harvest calls. Redirect script output to a temp file and Read it back instead of letting it print directly:

```
python3 .claude/skills/akiba-article-harvester/scripts/harvest.py list all > /tmp/harvest_out.txt 2>&1
```
Then `Read` `/tmp/harvest_out.txt`. Applies to every `harvest.py` call below.

### DNS / Network Failures

Sources often fail in agent sandboxes with transient DNS/network errors. The script retries automatically (3 attempts, backoff). On `FETCH FAILED after retries` or DNS errors like `Temporary failure in name resolution`, rerun the same `harvest.py` command with escalated network permissions rather than switching to manual fetching.

Same for images: prefer `curl -L --retry 3 --retry-delay 2 --connect-timeout 10 "<image-url>" -o public/images/articles/<slug>.<ext>`; on DNS/sandbox failure, rerun with escalated network permissions.

## Harvest Script

`scripts/harvest.py` bakes in source-specific parsing fixes from past runs (wrong href shapes, titles hidden in `title=""` attrs, stale archived listings — see script comments). Four subcommands:

- `list <source|all>` — candidate `(title, url)` pairs for one source (`atre`, `shosen`, `prtimes`, `walkerplus`, `collabocafe`, `gamers`, `enjoytokyo`, `akibapc_info`, `akibapc_event`, `animate`, `amiami_realstore`, `kotobukiya`, `mogra`, `akihabara_zest`, `akihabara_galaxy`, `club_goodman`, `gnews`, `ceek`) or `all`. Collapses syndicated title duplicates (same story, multiple outlets — common on gnews/ceek) to one row with `(xN)`, and drops out-of-scope rows per [Candidate Rules](#candidate-rules) (crime/incident with no local-impact angle, routine stock/restock posts with no event/opening/closing/collab angle). Also auto-skips rows whose URL (normalized) exactly matches an existing article's `sources[].url`/`image.sourceUrl`, or a URL already logged in `references/excluded-candidates.jsonl` — these are rows a prior harvest pass already turned into an article or explicitly held/rejected, so re-listing and re-researching them every pass is wasted work. Header reports `(N shown / M total, K crime-noise filtered, K stock-noise filtered, K already-in-articles.json skipped, K previously-excluded skipped)`. This URL-exact-match skip works well for primary/aggregator sources (collabocafe, kotobukiya, gamers, atre, shosen, animate, ...) since they reuse a stable per-event URL across passes; it rarely fires on `gnews`/`ceek` because Google News wraps a fresh redirect token per crawl (see [gnews redirect note](#duplicate-check) below) — those two still need the full `dedup` batch every pass. Pass `list all --all` (or `list <source> --all`) to disable the skip and see every raw row, e.g. when you suspect the filter itself is hiding something it shouldn't. Heuristic on title text only for the noise filters — if a pass seems to miss something, rerun `list <source>` and check total vs filtered.
- `detail <url>...` — fetches detail page(s), prints `TITLE`/`OGIMG`/`OGDESC`/`FACTS` (date, venue, price, reservation lines). Use for step 6 instead of WebFetch. Warns if page mentions 神保町/グランデ (shosen Jimbocho store — out of scope).
- `dedup <candidate>...` — see [Duplicate Check](#duplicate-check). Also checks `references/excluded-candidates.jsonl` and prints `PREVIOUSLY EXCLUDED (<reason>, checked <date>)` so a held/rejected URL isn't re-researched.
- `exclude "<url>" "<reason>" "<note>"` — append one held/rejected candidate to `references/excluded-candidates.jsonl`. See [Excluded Candidates Log](#excluded-candidates-log).

If a source's HTML structure changes and extraction breaks, fix the relevant `SOURCES` entry (or `gnews`/`ceek` branch) in the script directly — keeps the fix for future runs.

## Excluded Candidates Log

`references/excluded-candidates.jsonl` records every researched candidate URL that was held/rejected — not a duplicate (that's `sources[].url` in `data/articles.json`), but out of scope, ended, or not worth an article. Without it, the same low-value URL gets re-fetched and re-evaluated every pass.

- One JSON object/line: `{"url": "...", "reason": "...", "note": "...", "checked": "YYYY-MM-DD"}`.
- `reason` values: `out_of_scope_venue` (e.g. shosen Jimbocho/Grande), `event_ended` (period already over), `not_akihabara_specific` (real event tied to non-Akihabara location or generic national campaign), `insufficient_facts` (source lacked confirmable core facts), `low_value` (in-scope but not worth an article).
- `dedup` auto-checks candidate URLs (and `keyword|url`) against this log and prints `PREVIOUSLY EXCLUDED` — treat as a duplicate signal: skip deep fact-checking unless something material changed (e.g. `insufficient_facts` with a new source now confirming facts, or `event_ended` that's actually a new run at a new venue/date).
- Log immediately after holding/rejecting during a pass: `python3 .claude/skills/akiba-article-harvester/scripts/harvest.py exclude "<url>" "<reason>" "<short note>"`. Do this per-candidate, not just a summary at the end.
- Don't log a candidate that turned out to be a duplicate of an existing article — `sources[].url` already covers that; `dedup`'s `SOURCE URL MATCH`/slug-token checks catch it next pass.

## X.com Discovery

- Include X.com live search in every broad pass: source-list URL plus keyword variants (`秋葉原 イベント`, `秋葉原 コラボ`, `秋葉原 ポップアップ`, `秋葉原 オープン`, `秋葉原 閉店`, `秋葉原 ニュース`, `秋葉原 出来事`, `秋葉原 話題`, `アキバ イベント`, `AKIHABARA POP UP`) and venue names.
- X.com is discovery/supporting evidence only — never write an article from an unverified tweet alone.
- Prefer official venue/shop/organizer/publisher/label/brand accounts. Drop fan accounts, repost aggregators, anonymous accounts unless linking to an official page.
- When X reveals a candidate, search the exact title/account/venue/date/domain for a primary source. Write only after confirming date, venue, price/admission, reservation/ticket rules, and usable image from official/primary sources.
- Record an X.com source only when the official post confirms a fact not covered elsewhere, or as the discovery source alongside a primary confirmation source.
- If X.com blocks browsing/login, fall back to web search targeting `x.com` and official sites; report X.com blocked only if no usable result is found.

## Bulk Harvesting Bias

- Default: maximize safe additions — add every in-scope, non-duplicate, fact-confirmed candidate, all in one pass.
- Don't ask the user to pick unless too many low-confidence options or conflicting sources.
- Favor complete facts and usable images; skip uncertain candidates rather than slowing the batch.
- Under time/quality pressure, prioritize near-future events, official/primary sources, clear Akihabara venues, distinct article variety.
- One JSON edit batch for all selected candidates, save all images, one build.

## Candidate Rules

Include:
- Events, fairs, pop-ups, collaborations, campaigns, exhibits, performances, signings, workshops, and other scheduled visitor-facing activities.
- Non-event happenings: store openings/reopenings/renewals/relocations/closures, service launches, notable local product launches, local campaigns, building/area changes, facility updates, public notices, incidents with clear public impact, culture/news with clear reader value.
- Items in or materially affecting Akihabara proper, around Akihabara Station, Suehirocho, Kanda, Awajicho/Ochanomizu, Iwamotocho, or venues already used by existing articles.
- Reservation/ticket/preorder/application pages only when the physical venue/store/pickup point/local action is in scope.

Exclude:
- Ordinary PC/electronics stock arrivals, restocks, sales (入荷・販売情報) with no collab/event angle — e.g. GPU/CPU restocks, parts sales, junk lots, price drops. Include only when tied to a collab, event, opening/closure, or other notable local happening.
- Generic national campaigns with no specific Akihabara venue.
- Pure press releases with no local action/venue/impact/Akihabara-specific reader value.
- Crime/accident/emergency items whose only value is sensational detail; include only with clear local public impact (closures, access restrictions, safety notices, major service changes).
- Items already in `data/articles.json`.
- Items with missing core facts no reliable source can confirm. Events need date + venue. Non-events need announcement/effective date, location/affected entity, and concrete user impact.

## Duplicate Check

**Title-keyword search alone under-detects duplicates.** Articles here are usually titled formally/officially (e.g. `「オタクに優しいギャルはいない!?」POP UP SHOPがボークス秋葉原ホビー天国2で開催`) while aggregators use colloquial nicknames (e.g. collabocafe's `オタギャル`) — a plain `rg` for the colloquial keyword finds nothing even if already added. Don't re-learn this the expensive way.

Before writing, for every candidate, run one batched check:

```
python3 .claude/skills/akiba-article-harvester/scripts/harvest.py dedup \
  "<keyword1>|<source-url-1>" "<keyword2>|<source-url-2>" ... > /tmp/dedup_out.txt 2>&1
```

Then `Read` `/tmp/dedup_out.txt`. Checks per candidate:
1. Japanese keyword as substring of existing `title`/`summary`/`content`.
2. Romanized tokens from the candidate's own source URL (aggregator URLs carry an English slug, e.g. `.../otagal-animal-butler-and-maid-popup-store-akihabara2026/`) against existing article `slug`s.
3. Same tokens against filenames under `public/images/articles/`.

A match is a heuristic signal, not proof — open the existing article and compare dates/venue before concluding it's a true duplicate (multi-run franchises legitimately get a new pop-up periodically at the same venue).

Additional checks:
- Compare source URLs/event IDs (WalkerPlus `/event/ar0313e.../`, LivePocket `/e/...`, Atre `/news/...`).
- Treat `SOURCE URL MATCH` as an existing article unless the source page clearly changed to a different event — don't create a new article.
- If the source URL doesn't match but the same item exists by title, slug/image token, venue/date, performer, campaign/product name, or official event ID, don't create another article.
- On a duplicate, merge into the existing article: add any new source URL to `sources`, add newly confirmed facts to `summary`/`content`/`event` when useful, keep/replace the image only if better, preserve the existing slug unless the user asks to rename.
- Dedupe `sources` by normalized URL: strip fragments, tracking params (`utm_*`, `fbclid`, `gclid`, etc.), trailing slashes, mobile/desktop variants.
- Report merged duplicates under `重複`/`マージ` with the existing slug — not as skipped when source/content was added.
- When harvesting many items, maintain a temporary ledger: `new`/`duplicate`/`hold`. Only `new` gets written.
- Rerun the dedup batch once more right before final edits with the full selected list, to catch late duplicates.
- Every `hold`/rejected candidate must be logged to `references/excluded-candidates.jsonl` via `harvest.py exclude` — see [Excluded Candidates Log](#excluded-candidates-log). This is what makes the next pass skip re-researching it.

## Source Recording

- Every article keeps discovery/confirmation sources in `sources`.
- Save all source pages actually used: source-list/discovery page, aggregator page, primary/official page, ticket page, venue page, press release, official SNS page when it confirms facts.
- Add official/reference/ticket/venue/SNS URLs to `sources` when they exist — the site renders these under `公式URL・参考URL`.
- Always try to find a primary/official URL when the candidate comes from an aggregator. Rely on aggregator-only sources only when no official page is found after searching the exact title, venue, organizer, date.
- When `image.sourceUrl` points to an official/reference page not already in `sources`, add it too.
- Order: primary/official first, then ticket/venue, then aggregators/discovery.
- Keep multiple `sources` entries when the same event has multiple sources — don't replace the earlier one.
- Dedupe sources by normalized URL (ignore trailing slashes, tracking params, mobile/desktop variants).
- Use clear labels: `公式サイト`, `公式ニュース`, `TIGET イベントページ`, `アトレ秋葉原 公式ニュース`, `店舗公式ブログ`, `PR TIMES プレスリリース`, `Collabo Cafe 記事`, etc.

## Source Priority

1. Official event/campaign/venue/shop/ticket page, official store/company announcement, public notice.
2. Official SNS or press release.
3. Aggregators (WalkerPlus, Enjoy Tokyo, Collabo Cafe, PR TIMES) only when they clearly attribute details.

When an aggregator reveals an event but not enough facts, search the exact title/venue for a primary source.

### Per-source gotchas (already baked into `scripts/harvest.py`, matters when reading its output)

- **shosen**: `/event/` listing mixes 書泉ブックタワー (Akihabara, in scope) and 書泉グランデ (Jimbocho, out of scope) without saying which. Always run `harvest.py detail` on the event URL and check for the 神保町/グランデ warning before writing.
- **gamers**: `event_fair/list.php` mixes current fairs (detail `id` ~7000+) with years-old archived ones (`id` in the low hundreds). Confirm the actual 開催期間 on the detail page is current/future before treating as a candidate.
- **collabocafe**: `/events/tag/akihabara/` includes non-Akihabara legs of multi-city tours (Osaka, Nagoya, Shinjuku, Ikebukuro, etc). Confirm the Akihabara venue explicitly in the detail page's `OGDESC`/`FACTS` — don't assume every "akihabara"-tagged item is actually there.
- **walkerplus / enjoytokyo**: area-filtered listings are noisy — many results are Tokyo-wide, not Akihabara-specific. Low-precision; verify venue text explicitly.
- **AKIBA PC Hotline!**: high-value discovery but often aggregates several small items in one article. Split into separate articles only when each has enough facts and clear reader value; otherwise use as supporting discovery/source.
- **live house schedules**: include normal live events too, not only anime/game-adjacent, as long as venue is in scope and date/price/performers/visitor-facing details are clear.

## Output When Harvesting

If asked to add articles, implement directly.

Keep the response compact:
- `追加`: slugs created
- `重複`: existing slugs or titles
- `保留`: reason (missing source, unclear venue, no image — each already logged to `references/excluded-candidates.jsonl`)
- `確認`: `pnpm run validate:articles` and `pnpm build` result

Don't list every rejected candidate — report only added, duplicate, held, and verification.

## Writing Handoff

For each selected candidate, follow `$event-article-writer`:
- Use `data/articles.json` schema.
- Save images under `public/images/articles/`.
- Use placeholder handling only when no usable image exists.
- Add official/reference source URLs in `sources`.
- Include `en` field with English translations of `title`, `summary`, `content`.
- Set `authorId: 1` on every new article.
- Add `event` data only for dated events/campaigns/openings/closures that should appear on `/events`; omit for ordinary news without a useful event-style date/location.
- Update map coordinates in `components/events-map.tsx` when the venue should appear on `/events`.
- Run `pnpm run validate:articles` after edits; fix anything reported.
- Run `pnpm build` once after the whole batch is written and validated.
