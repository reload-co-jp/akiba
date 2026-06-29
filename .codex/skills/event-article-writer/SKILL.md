---
name: event-article-writer
description: Use this skill when adding or updating event articles for the Akiba site from source pages such as official event sites, ticket pages, event listings, or press releases. It covers researching the event, extracting facts and image URLs, updating `data/articles.json`, saving article thumbnails under `public/images/articles/`, and verifying the site build.
---

# Event Article Writer

Create or refresh event articles for this repository's Akiba event media.

Read [references/article-format.md](references/article-format.md) before editing article data.

## Workflow

1. Identify every event source used for discovery and fact confirmation.
2. Confirm the event facts from primary or clearly attributable sources.
3. Download a usable thumbnail image when available.
4. Add or update the article entry in `data/articles.json`, including the `en` translation field.
5. Verify the article route and metadata with `pnpm build`.

## Source Rules

- Browse the web for event details. Event dates, prices, venues, and reservation rules are time-sensitive.
- Prefer official event sites, official ticketing pages, official SNS, venue pages, and primary press releases.
- If the direct source blocks scraping or hides details behind JavaScript, use a reliable secondary page that clearly attributes the event and keep both the original page and the secondary page in `sources` when possible.
- Keep every source page used to find or confirm the article in `sources`. If multiple sources point to the same event, save all non-duplicate source URLs rather than choosing only one.
- Add every available official/reference link to `sources`: official event/campaign pages, ticket/reservation pages, venue/shop pages, official SNS posts, primary press releases, and reliable reference articles. The article detail page renders `sources` under `公式URL・参考URL`.
- When starting from an aggregator or press article, search for the official event/shop/venue URL and include it before the aggregator whenever found.
- If `image.sourceUrl` points to an official/reference page that is not already listed, add the same URL to `sources` too.
- When updating an existing article because a duplicate was found from a new source, append the new source to `sources` if absent. Do not rewrite article facts unless the user asked for refresh or the new source corrects a clear error.
- Keep dates explicit in `YYYY-MM-DD` format inside JSON.
- Do not invent missing facts. Omit or soften claims when the source is unclear.

## Writing Rules

- Match the existing article voice in `data/articles.json`: concise, factual, and event-guide oriented.
- Keep the JSON entry shaped like the existing article schema in the reference file.
- Use a short summary that works in cards and metadata.
- When a source page contains a notable quote, tagline, or description that captures the event accurately, include it verbatim in `content` as a blockquote (`> text`) with attribution (e.g., `> — 公式サイトより`). Only include quotes that add real reader value; skip boilerplate marketing copy.
- Structure `content` with these sections unless the event genuinely needs a variation:
  - `## 概要`
  - `## 内容`
  - `## 開催情報`
  - `## こんな人におすすめ`
- **Section writing guidance:**
  - `## 概要`: 2〜3文の prose で書く。何のイベントか・どこが特徴か・なぜ注目かを文章で説明する。箇条書き禁止。
  - `## 内容`: 最初に 1〜2文の prose で全体の魅力・性格を説明し、その後に具体的な展示物・コンテンツ・特典などを箇条書きで列挙する。prose なしで箇条書きだけで始めない。
  - `## 開催情報`: 日時・会場・料金・予約可否など構造化された箇条書きで書く。
  - `## こんな人におすすめ`: 2〜3の短い箇条書き、または 1〜2文の prose。
- Put actionable event facts in both `content` and `event`.
- Add `sources` for every article. Use the clearest human-readable label you can. Order primary/official sources first, then ticket/venue pages, then aggregators or discovery sources.
- Use labels that clarify link type, such as `公式サイト`, `公式ニュース`, `チケットページ`, `会場公式サイト`, `公式X`, `PR TIMES プレスリリース`, or `Collabo Cafe 記事`.
- Set `authorId` to `1` on every new article.

## Translation Rules

Every new article must include an `en` field. See the section heading mapping and rules in [references/article-format.md](references/article-format.md).

- Translate all facts accurately; do not omit or invent details.
- Keep bullet structure and formatting consistent with the Japanese `content`.
- Do not translate `tags`, `event.*`, `image.alt`, or `sources`.

## Image Rules

- Save article images under `public/images/articles/`.
- Name files from the slug, for example `public/images/articles/my-event-2026.webp`.
- Reuse the source page's lead image or OGP image when practical.
- After download, check the actual file type with `file` and rename the extension if needed.
- Set `image.src` to the site path, `image.alt` to a factual description, and `image.sourceLabel` / `image.sourceUrl` when known.

## Editing Checklist

- Pick the next numeric `id` in `data/articles.json`.
- Create a stable slug in English lowercase with hyphens.
- Set `publishedAt` to the article publish date used by the site.
- Keep `tags` short and scannable.
- Set `event.reservation` to `true` only when reservation, ticket purchase, or advance registration is actually required or strongly indicated.
- Include `en` field with translated `title`, `summary`, and `content`.
- Include `authorId: 1`.

## Verification

- Run `pnpm build` after edits.
- Confirm the generated route appears in build output.
- If an image was added, make sure the file exists under `public/images/articles/`.
- If the article includes `image`, the detail page should emit the OGP image automatically through existing app code.
