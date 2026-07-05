# Akiba Live

Akiba Live is a static Next.js news site for Akihabara entertainment, events, pop-up stores, collaboration cafes, shops, openings/closures, and sightseeing spots.

Production URL: `https://akiba.reload.co.jp`

## Current Scope

- Japanese news pages under `/`
- English article/event pages under `/en/` when article data has `en`
- Article list, article detail, tags, authors, monthly archives, and search page
- Event indexes: ongoing, today, this week, monthly, calendar, pop-up stores, collaboration cafes
- Sightseeing spot list and spot detail pages
- RSS, Atom, standard sitemap, Google News sitemaps, robots.txt, `llms.txt`, and `llms-full.txt`
- Static export via Next.js `output: "export"`

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- JSON-backed content in `data/`
- Static images in `public/images/`
- pnpm 11

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm start
pnpm format
pnpm update-image-dims
```

`pnpm build` generates the static export. Images are configured with `unoptimized: true` for static hosting.

## Environment

`NEXT_PUBLIC_SITE_URL` overrides canonical URL generation. Default:

```bash
https://akiba.reload.co.jp
```

The value is normalized without a trailing slash in `lib/site.ts`.

## Main Routes

- `/` home
- `/articles/` article list
- `/articles/[slug]/` Japanese article detail
- `/en/articles/[slug]/` English article detail, generated only for articles with `en`
- `/akiba-today/` daily summary page
- `/events/` ongoing events
- `/events/today/` events happening today
- `/events/this-week/` upcoming events this week
- `/events/monthly/` monthly event index
- `/events/calendar/` calendar view
- `/events/popup/` pop-up store index
- `/events/collab-cafe/` collaboration cafe index
- `/tags/[id]/` tag archive
- `/en/tags/[id]/` English tag archive
- `/authors/[id]/` author archive
- `/articles/month/` month archive list
- `/articles/month/[month]/` month archive
- `/spots/` sightseeing spot list
- `/spots/[slug]/` sightseeing spot detail
- `/search/` article search
- `/about/`, `/terms/`, `/privacy/`
- `/rss.xml`, `/atom.xml`
- `/sitemap.xml`, `/news-sitemap.xml`, `/news-sitemap-en.xml`
- `/llms.txt`, `/llms-full.txt`

## Data Files

- `data/articles.json`: articles and event metadata
- `data/tags.json`: tag master data
- `data/authors.json`: author master data
- `data/spots.json`: sightseeing spot master data

Images live in:

- `public/images/articles/`
- `public/images/spots/`
- `public/images/placeholder.jpg`

## Article Data

Canonical article shape is defined in `lib/articles.ts`.

```json
{
  "id": 523,
  "title": "記事タイトル",
  "seoTitle": "検索向け短縮タイトル",
  "slug": "article-slug",
  "summary": "概要文",
  "content": "Markdown本文",
  "publishedAt": "2026-07-06",
  "tagIds": [47, 177],
  "en": {
    "title": "English title",
    "summary": "English summary",
    "content": "English Markdown content"
  },
  "image": {
    "src": "/images/articles/article-slug.jpg",
    "alt": "画像代替テキスト",
    "width": 1200,
    "height": 800,
    "sourceLabel": "画像出典名",
    "sourceUrl": "https://example.com"
  },
  "sources": [
    {
      "label": "公式サイト",
      "url": "https://example.com"
    }
  ],
  "event": {
    "venue": "会場名",
    "startDate": "2026-10-12",
    "endDate": "2026-10-31",
    "price": "入場無料",
    "reservation": false,
    "performer": "出演者"
  },
  "authorId": 1
}
```

Required fields:

- `id`
- `title`
- `slug`
- `summary`
- `content`
- `publishedAt`
- `tagIds`

Optional but commonly used:

- `seoTitle`: long titles only. `<title>`/OGP/Twitter use `【秋葉原】${seoTitle}`. Page heading keeps `title`.
- `en`: enables `/en/articles/[slug]/` and English event/tag pages.
- `image`: falls back to `/images/placeholder.jpg` when omitted.
- `sources`: rendered as reference links and included in LLM indexes.
- `event`: enables event indexes and date filtering.
- `authorId`: connects to `data/authors.json`.

Event filtering compares `startDate`/`endDate` as `YYYY-MM-DD` strings, so keep zero-padded ISO dates.

## Tags

Articles use numeric `tagIds`. Tag names come from `data/tags.json`.

```json
{
  "id": 47,
  "name": "イベント",
  "nameEn": "Events"
}
```

When adding a new tag:

1. Add the tag to `data/tags.json`.
2. Use its numeric `id` in `article.tagIds`.
3. Keep `nameEn` when the tag appears on English pages.

## Authors

Authors live in `data/authors.json` and connect through `article.authorId`.

```json
{
  "id": 1,
  "name": "アキバLive編集部",
  "description": "説明文",
  "schemaType": "Organization"
}
```

`schemaType` can be `Person` or `Organization`.

## Spots

Spot shape is defined in `lib/spots.ts`.

```json
{
  "id": 1,
  "name": "スポット名",
  "slug": "spot-slug",
  "category": "アニメ・マンガ・同人",
  "description": "説明文",
  "address": "住所",
  "access": "アクセス",
  "hours": "営業時間",
  "closed": "定休日",
  "admission": "料金",
  "website": "https://example.com",
  "lat": 35.7009,
  "lng": 139.7713,
  "image": {
    "src": "/images/spots/spot-slug.jpg",
    "alt": "画像代替テキスト",
    "width": 1200,
    "height": 800,
    "sourceLabel": "画像出典名",
    "sourceUrl": "https://example.com"
  },
  "en": {
    "name": "English name",
    "description": "English description",
    "access": "English access",
    "hours": "English hours",
    "closed": "English closed info",
    "admission": "English admission"
  },
  "tags": ["アニメ", "グッズ"],
  "aliases": ["別名"]
}
```

Related article lookup matches `article.event.venue` against spot `name` and `aliases`.

## Content Rules

- Article body uses Markdown and is converted with `marked`.
- Article template usually follows: `概要`, `内容`, `開催情報`, `こんな人におすすめ`.
- Keep facts tied to `sources`.
- Use local images under `public/images/articles/` or `public/images/spots/`.
- Add image `width`/`height` when possible. Run `pnpm update-image-dims` after adding images.
- Use `tagIds`, not free-form article `tags`, for UI and archives.
- Keep slugs stable because they are canonical URLs.

## SEO And Feeds

- Site constants live in `lib/site.ts`.
- Article SEO helpers live in `lib/articles.ts`.
- Feed builders live in `lib/feeds.ts`.
- LLM index builders live in `lib/llms.ts`.
- `robots.ts` allows standard crawlers plus major AI/search bots.
- `sitemap.ts` includes articles, English alternates, tags, authors, spots, and archive pages.

## Project Layout

```text
app/          Next.js routes
components/   Shared UI components
data/         JSON content
lib/          Data access, formatting, feeds, SEO helpers
public/       Static assets and images
scripts/      Maintenance scripts
```

## Development Notes

- TypeScript is intentionally loose: `strict: false`.
- Path imports use `baseUrl: "."`, so code can import from `lib/...`.
- The repository can contain generated article/image updates. Check `git status` before editing shared data files.
- `SPEC.md` is historical and does not fully match the current implementation. Treat code and this README as current.
