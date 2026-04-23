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
- `event.venue` can include floor information when it is part of the source listing.
- `price` is display text, not normalized numeric data.
- `reservation` is a boolean summary, not a detailed reservation policy.
