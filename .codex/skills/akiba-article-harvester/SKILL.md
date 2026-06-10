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
2. Browse the requested source page, or all source pages when the user asks for broad harvesting. For broad harvesting, always include X.com live search and news/discovery sources from `references/source-list.md` in the discovery pass.
3. Build a candidate queue before writing. Aim for as many solid candidates as possible; do not cap the batch at 5-10 when more verified candidates are available. Stop only when sources are exhausted or verification is blocked.
4. Extract candidate items that clearly relate to Akihabara, nearby Kanda/Ochanomizu/Iwamotocho when relevant, or venues already covered by the site. Include both event items and non-event local happenings / "秋葉原で起こった出来事".
5. Deduplicate the whole queue against `data/articles.json` by title, slug, event/news name, source URL, venue/location/date combination, store or company name, and recognizable campaign names. Drop duplicates before drafting new articles.
6. For each remaining candidate, open the primary source when possible and confirm the facts relevant to the item: date or announcement timing, location, operator/organizer, price or user impact when applicable, reservation/ticket rules when applicable, and image. Keep every source page used to find or confirm the candidate.
7. Add all verified non-duplicate articles in one edit batch following `$event-article-writer` rules. Set `authorId` to `1` on every new article, then verify once with `pnpm build`.

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

Before writing:

- Search existing article data with `rg -n "<event keyword>|<venue>|<source id>" data/articles.json`.
- Compare normalized titles: remove brackets, quote marks, 「開催」, 「オープン」, 「リニューアル」, 「閉店」, date suffixes, and campaign subtitles.
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
- Use clear labels such as `公式サイト`, `公式ニュース`, `TIGET イベントページ`, `アトレ秋葉原 公式ニュース`, `店舗公式ブログ`, `PR TIMES プレスリリース`, or `Collabo Cafe 記事`.

## Source Priority

Prefer primary or official sources over aggregators:

1. Official event/campaign page, venue page, shop page, ticket page, official store/company announcement, or public notice.
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
- Set `authorId: 1` on every new article.
- Add `event` data only when the article is a dated event, campaign, opening, closure, or other item that should appear on `/events`. For ordinary news without a useful event-style date/location, omit `event`.
- Update map coordinates in `components/events-map.tsx` when the venue/location should appear on `/events`.
- Run `pnpm build` after edits.
