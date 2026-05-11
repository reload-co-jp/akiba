# Article Format

Use these files when creating or updating event articles:

- `data/articles.json`: source of truth for article content
- `lib/articles.ts`: TypeScript shape used by the app
- `public/images/articles/`: local article thumbnails

## Current Article Shape

```json
{
  "id": 1,
  "title": "【秋葉原】イベント名",
  "slug": "event-slug-2026",
  "summary": "一覧とメタデータ向けの短い要約。",
  "content": "## 概要\n\n...\n\n## 内容\n\n...\n\n## 開催情報\n\n...\n\n## こんな人におすすめ\n\n...",
  "publishedAt": "2026-04-24",
  "tags": ["イベント", "秋葉原"],
  "en": {
    "title": "[Akihabara] Event Name",
    "summary": "Short summary for listings and metadata.",
    "content": "## Overview\n\n...\n\n## Highlights\n\n...\n\n## Event Details\n\n...\n\n## Recommended For\n\n..."
  },
  "image": {
    "src": "/images/articles/event-slug-2026.webp",
    "alt": "イベントビジュアルの説明",
    "sourceLabel": "公式サイト",
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
    "startDate": "2026-05-01",
    "endDate": "2026-05-02",
    "price": "基本無料",
    "reservation": false
  }
}
```

## Notes

- `image` and `sources` are optional in TypeScript, but event articles in this repo should include them whenever possible.
- `sources` stores every source page used while harvesting or writing: discovery pages, aggregators, official pages, ticket pages, venue pages, press releases, and official SNS pages when they confirm facts.
- When the same event is discovered from multiple sources, keep multiple `sources` entries. Deduplicate only exact or normalized URL duplicates.
- Order `sources` by reliability: primary/official, ticket/venue, press release, aggregator/discovery.
- `event.venue` can include floor information when it is part of the source listing.
- `price` is display text, not normalized numeric data.
- `reservation` is a boolean summary, not a detailed reservation policy.

## English Translation (`en` field)

Every article must include an `en` field with English translations of `title`, `summary`, and `content`.

Section heading mapping:

- `## 概要` → `## Overview`
- `## 内容` → `## Highlights`
- `## 開催情報` → `## Event Details`
- `## こんな人におすすめ` → `## Recommended For`

Translation rules:

- Translate facts accurately; do not rephrase or omit event details.
- Keep bullet list structure in `content` (venue, dates, hours, price, reservation).
- Render Japanese yen amounts as `¥X,XXX` in English content.
- Dates in `## Event Details` use English month names (e.g. `May 29–31, 2026`).
- `en.title` starts with `[Akihabara]` when the Japanese title starts with `【秋葉原】`.
- Do not translate `tags`, `event.*`, `image.alt`, or `sources`.
