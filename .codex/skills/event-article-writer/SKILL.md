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
- When updating an existing article because a duplicate was found from a new source, append the new source to `sources` if absent. Do not rewrite article facts unless the user asked for refresh or the new source corrects a clear error.
- Keep dates explicit in `YYYY-MM-DD` format inside JSON.
- Do not invent missing facts. Omit or soften claims when the source is unclear.

## Writing Rules

- Match the existing article voice in `data/articles.json`: concise, factual, and event-guide oriented.
- Keep the JSON entry shaped like the existing article schema in the reference file.
- Use a short summary that works in cards and metadata.
- Structure `content` with these sections unless the event genuinely needs a variation:
  - `## 概要`
  - `## 内容`
  - `## 開催情報`
  - `## こんな人におすすめ`
- Put actionable event facts in both `content` and `event`.
- Add `sources` for every article. Use the clearest human-readable label you can. Order primary/official sources first, then ticket/venue pages, then aggregators or discovery sources.

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

## Verification

- Run `pnpm build` after edits.
- Confirm the generated route appears in build output.
- If an image was added, make sure the file exists under `public/images/articles/`.
- If the article includes `image`, the detail page should emit the OGP image automatically through existing app code.
