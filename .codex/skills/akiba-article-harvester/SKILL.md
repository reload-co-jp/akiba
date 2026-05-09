---
name: akiba-article-harvester
description: Use this skill when asked to find, collect, or add new Akihabara-related articles by checking recurring source sites for events, campaigns, collaborations, pop-ups, store openings, or closures. It covers source巡回, duplicate checks against `data/articles.json`, fact confirmation, and handing selected candidates to the article-writing workflow.
---

# Akiba Article Harvester

Find new Akihabara article candidates from a fixed set of sources, avoid duplicates, then create article entries using the repo's article format.

Use this skill before `$event-article-writer` when the user asks to "秋葉原の記事を作成", "イベントを拾う", "新規記事候補を探す", "巡回して追加", or provides one of the source-list pages instead of a specific event page.

## Quick Start

1. Read [references/source-list.md](references/source-list.md).
2. Browse the requested source page, or all source pages when the user asks for broad harvesting.
3. Extract candidate items that clearly relate to Akihabara, nearby Kanda/Ochanomizu/Iwamotocho when relevant, or venues already covered by the site.
4. Check duplicates in `data/articles.json` by title, slug, event name, source URL, venue/date combination, and recognizable campaign names.
5. For each new candidate, open the primary source when possible and confirm date, venue, price, reservation/ticket rules, and image.
6. Add the selected article(s) following `$event-article-writer` rules and verify with `pnpm build`.

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
- If same event exists but new source has better facts, update the existing article only when user asked for refresh; otherwise report duplicate.

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

## Writing Handoff

For each selected candidate, follow `$event-article-writer`:
- Use `data/articles.json` schema.
- Save article images under `public/images/articles/`.
- Use placeholder handling only when no usable image exists.
- Add source URLs.
- Include `en` field with English translations of `title`, `summary`, and `content`.
- Update map coordinates in `components/events-map.tsx` when the event venue should appear on `/events`.
- Run `pnpm build` after edits.
