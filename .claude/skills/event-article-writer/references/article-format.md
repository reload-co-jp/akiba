# Article Format

Use these files when creating or updating event articles:

- `data/articles.json`: source of truth for article content
- `lib/articles.ts`: TypeScript shape used by the app
- `public/images/articles/`: local article thumbnails

## Current Article Shape

```json
{
  "id": 1,
  "title": "イベント名",
  "slug": "event-slug-2026",
  "summary": "一覧とメタデータ向けの短い要約。",
  "content": "## 概要\n\n[イベントの概要を2〜3文のproseで。何のイベントか、どこが特徴か、なぜ注目かを書く。箇条書きにしない。]\n\n## 内容\n\n[全体の魅力・性格を1〜2文のproseで説明してから、具体的なコンテンツ・展示・特典を箇条書きで続ける。]\n\n- [コンテンツ項目1]\n- [コンテンツ項目2]\n\n## 開催情報\n\n- **日時**: YYYY年M月D日（曜）〜 M月D日（曜）\n- **会場**: 会場名（フロア情報があれば含める）\n- **料金**: 入場無料 / ¥X,XXX など\n- **予約**: 要事前予約 / 予約不要 など\n\n## こんな人におすすめ\n\n- [ターゲット1]\n- [ターゲット2]\n- [ターゲット3]",
  "publishedAt": "2026-04-24",
  "tags": ["イベント", "秋葉原"],
  "en": {
    "title": "Event Name",
    "summary": "Short summary for listings and metadata.",
    "content": "## Overview\n\n[2-3 sentences of prose. What the event is, what makes it distinctive, why it is worth visiting. No bullet points.]\n\n## Highlights\n\n[1-2 sentences of prose describing the overall character or appeal, then bullet points for specific content items.]\n\n- [Content item 1]\n- [Content item 2]\n\n## Event Details\n\n- **Dates**: Month D–D, YYYY\n- **Venue**: Venue name (floor if available)\n- **Price**: Free admission / ¥X,XXX etc.\n- **Reservation**: Required / Not required etc.\n\n## Recommended For\n\n- [Target audience 1]\n- [Target audience 2]\n- [Target audience 3]"
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

- `title` must NOT include the `【秋葉原】` prefix. `addAkihabaraSeoTitle()` in `lib/articles.ts` adds it dynamically at render time for `<title>`, OGP, Twitter Card, and JSON-LD.
- Keep `title` around 32 full-width characters or fewer (excluding the dynamic `【秋葉原】` prefix) so it does not get truncated in Google search results. Event name + venue + "で開催" style titles easily exceed this — trim modifiers or shorten the venue name when the full event name makes it too long.
- `image` and `sources` are optional in TypeScript, but event articles in this repo should include them whenever possible.
- `sources` stores every source page used while harvesting or writing: discovery pages, aggregators, official pages, ticket pages, venue pages, press releases, and official SNS pages when they confirm facts.
- The article detail page renders `sources` as `公式URL・参考URL`. Add every official/reference URL found, including official event/campaign pages, ticket/reservation pages, venue/shop pages, official SNS posts, primary press releases, and reliable reference articles.
- If `image.sourceUrl` is an official/reference page and is not already in `sources`, add it to `sources` too.
- When the same event is discovered from multiple sources, keep multiple `sources` entries. Deduplicate only exact or normalized URL duplicates.
- Order `sources` by reliability: primary/official, ticket/venue, press release, aggregator/discovery.
- Use human-readable labels that identify link type, e.g. `公式サイト`, `公式ニュース`, `チケットページ`, `会場公式サイト`, `公式X`, `PR TIMES プレスリリース`, `Collabo Cafe 記事`.
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
- `en.title` should NOT include the `[Akihabara]` prefix. If `en.title` does not already mention "Akihabara" or "Tokyo", `getEnglishSeoTitle()` appends "in Akihabara, Tokyo" automatically at render time — do not duplicate it manually.
- Do not translate `tags`, `event.*`, `image.alt`, or `sources`.
