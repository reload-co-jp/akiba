---
name: akiba-article-harvester
description: >
  Use this skill when asked to find, collect, or add new Akihabara-related
  articles by checking recurring source sites for events, campaigns,
  collaborations, pop-ups, store openings, or closures. It prioritizes bulk
  harvesting: collect many candidates, remove duplicates against
  `data/articles.json`, confirm facts, then add as many non-duplicate articles
  as can be safely verified in one pass.
---

# Akiba Article Harvester

Find new Akihabara article candidates from a fixed set of sources, avoid duplicates, then create as many verified article entries as practical using the repo's article format.

Use this skill before `$event-article-writer` when the user asks to "秋葉原の記事を作成", "イベントを拾う", "新規記事候補を探す", "巡回して追加", or provides one of the source-list pages instead of a specific event page.

## Quick Start

1. Read [references/source-list.md](references/source-list.md).
2. Browse the requested source page, or all source pages when the user asks for broad harvesting.
3. Build a candidate queue before writing. Prefer 5-10 solid candidates per pass when available; do not stop after the first one or two unless sources are exhausted or verification is blocked.
4. Extract candidate items that clearly relate to Akihabara, nearby Kanda/Ochanomizu/Iwamotocho when relevant, or venues already covered by the site.
5. Deduplicate the whole queue against `data/articles.json` by title, slug, event name, source URL, venue/date combination, and recognizable campaign names. Drop duplicates before drafting new articles.
6. For each remaining candidate, open the primary source when possible and confirm date, venue, price, reservation/ticket rules, and image. Keep every source page used to find or confirm the candidate.
7. Add all verified non-duplicate articles in one edit batch following `$event-article-writer` rules, then verify once with `pnpm build`.

## Bulk Harvesting Bias

- Default behavior is "maximize safe additions": add every candidate that is in scope, non-duplicate, and fact-confirmed.
- Do not ask the user to pick from candidates unless there are too many low-confidence options or the sources conflict.
- Favor candidates with complete facts and usable images. Skip uncertain candidates rather than slowing the batch.
- When time or source quality forces a limit, prioritize near-future events, official/primary sources, clear Akihabara venues, and distinct article variety.
- Make one JSON edit batch for all selected candidates, save all images, then run one build.

## Candidate Rules

Include:
- Events, fairs, pop-ups, collaborations, campaigns, exhibits, performances, signings, workshops, store openings, renewals, closures, and notable local changes.
- Items happening in Akihabara proper, around Akihabara Station, Suehirocho, Kanda, Awajicho/Ochanomizu, Iwamotocho, or Akihabara-adjacent venues used by existing articles.
- Online reservation or ticket pages only when the physical venue is in scope.

Exclude:
- Generic national campaigns with no specific Akihabara venue.
- Pure press releases with no local action unless the Akihabara venue or store is named.
- Items already covered in `data/articles.json`.
- Events with missing date or venue when no reliable source can confirm them.

## Duplicate Check

Before writing:

- Search existing article data with `rg -n "<event keyword>|<venue>|<source id>" data/articles.json`.
- Compare normalized titles: remove brackets, quote marks, 「開催」, date suffixes, and campaign subtitles.
- Compare source URLs and event IDs such as WalkerPlus `/event/ar0313e.../`, LivePocket `/e/...`, Atre `/news/...`.
- If same event exists, do not create another article. Add any newly found source URL to the existing article's `sources` array when it is not already present, then report the duplicate. Only update article facts/content when the user asked for refresh.
- When harvesting many items, maintain a temporary duplicate ledger: `new`, `duplicate`, `hold`. Only `new` candidates are written as articles.
- Before final edits, run one combined `rg -n "keyword1|keyword2|venue1|source-id"` check for all selected candidates to catch late duplicates.

## Source Recording

- Every article created through this skill must keep discovery and confirmation sources in `sources`.
- Save all source pages actually used: source-list/discovery page, aggregator page, primary/official page, ticket page, venue page, press release, and official SNS page when it confirms facts.
- Prefer putting primary/official sources first, then ticket/venue pages, then aggregators/discovery pages.
- When the same event is found from multiple sources, keep multiple entries in `sources`; do not replace the earlier source.
- Deduplicate sources by normalized URL. Ignore trailing slashes, tracking parameters, and obvious mobile/desktop variants.
- Use clear labels such as `公式サイト`, `TIGET イベントページ`, `アトレ秋葉原 公式ニュース`, `PR TIMES プレスリリース`, or `Collabo Cafe 記事`.

## Source Priority

Prefer primary or official sources over aggregators:

1. Official event/campaign page, venue page, shop page, ticket page.
2. Official SNS or official press release.
3. Aggregators such as WalkerPlus, Enjoy Tokyo, Collabo Cafe, PR TIMES, only when they clearly attribute details.

When an aggregator reveals an event but not enough facts, search the exact event title and venue to find a primary source.

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
- Add source URLs.
- Include `en` field with English translations of `title`, `summary`, and `content`.
- Update map coordinates in `components/events-map.tsx` when the event venue should appear on `/events`.
- Run `pnpm build` after edits.
