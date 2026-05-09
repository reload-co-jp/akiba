# Akiba Source List

Use these pages for recurring Akihabara article harvesting.

## Primary / Venue Sources

- アトレ秋葉原 news
  - URL: https://www.atre.co.jp/index.php/akihabara/news
  - Notes: strong source for Atre collaborations, pop-ups, store campaigns, building wraps. Prefer individual `/news/{id}` pages.

- 書泉 event
  - URL: https://www.shosen.co.jp/event/
  - Notes: strong source for book signings, photo book events, fairs. Filter for 書泉ブックタワー and Akihabara-related venue names.

- LivePocket Akihabara search
  - URL: https://t.livepocket.jp/event/search?word=%E7%A7%8B%E8%91%89%E5%8E%9F&pref=13&timespec=after_this
  - Notes: ticket/reservation source. Pages may block scraping; if blocked, search by event title or ask for visible details. Treat LivePocket listing as reservation evidence.

- GAMERS event/fair search
  - URL: https://www.gamers.co.jp/contents/event_fair/list.php?lmode=fair&category=0&keyword=AKIHABARA
  - Notes: strong source for AKIHABARAゲーマーズ本店 fairs and pop-up shops.

## Aggregator / Discovery Sources

- PR TIMES Akihabara search
  - URL: https://prtimes.jp/topics/keywords/%E7%A7%8B%E8%91%89%E5%8E%9F
  - Notes: good discovery for openings, campaigns, pop-ups. Prefer company/event official page after discovery.

- Google News RSS Akihabara search
  - URL: https://news.google.com/rss/search?q=%E7%A7%8B%E8%91%89%E5%8E%9F&hl=ja&gl=JP&ceid=JP:ja
  - Notes: broad news discovery for Akihabara openings, closures, campaigns, incidents, and local changes. Treat as discovery only; open the linked article and prefer primary or official sources before writing.

- Enjoy Tokyo Akihabara area
  - URL: https://www.enjoytokyo.jp/event/list/area1319/
  - Notes: event discovery. Confirm against official pages when possible.

- Collabo Cafe Akihabara tag
  - URL: https://collabo-cafe.com/events/tag/akihabara/
  - Notes: anime/game collaboration discovery. Prefer linked official store/campaign source.

- WalkerPlus Akihabara event list
  - URL: https://www.walkerplus.com/event_list/ar0313/sc309922d/
  - Notes: useful for workshops and local events. Individual pages may be enough when source attribution is clear; still search official/ticket page.

## Quick Search Patterns

- `rg -n "<event id>|<event title>|<venue>" data/articles.json`
- Web search: `"<event title>" 秋葉原`
- Web search: `site:<official-domain> "<event keyword>"`
- Web search: `"<venue>" "<date>" "<event keyword>"`
