# Akiba Source List

Use these pages for recurring Akihabara article harvesting.

Most sources below (except X.com) are fetched and parsed in one pass by `../scripts/harvest.py list all` — see [SKILL.md](../SKILL.md#harvest-script). Read that script's output from a redirected file rather than browsing these pages with WebFetch one at a time.

## Primary / Venue Sources

- アトレ秋葉原 news
  - URL: https://www.atre.co.jp/akihabara/news/
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

- アニメイト フェア・イベント
  - URL: https://www.animate-onlineshop.jp/contents/fair_event/
  - Notes: strong source for アニメイト秋葉原 fairs, only shops, reservation rules, and purchase bonuses. Filter for 秋葉原 / AKIHABARA in detail pages.

- あみあみ実店舗イベント
  - URL: https://realstore.amiami.jp/event/
  - Notes: primary source for あみあみ秋葉原ラジオ会館店 and あみあみ秋葉原フィギュアタワー店 events. May block scripted access; if blocked, use aggregator discovery and confirm with searchable official detail pages.

- コトブキヤ イベント一覧
  - URL: https://www.kotobukiya.co.jp/event/
  - Notes: source for Kotobukiya shop events, hobby exhibitions, campaigns, and limited sales. Filter for コトブキヤ秋葉原館 or Akihabara-related venue text.

- MOGRA 秋葉原
  - URL: https://club-mogra.jp/
  - Notes: source for anime song, game music, Touhou, DJ, and club events at 秋葉原MOGRA. Include normal live/DJ events when date, venue, price, and visitor value are clear.

- 秋葉原ZEST schedule
  - URL: https://akihabara-zest.com/schedule/
  - Notes: live house schedule. Include normal live events as well as idol, anime, game, and voice-actor adjacent events when details are complete.

- 秋葉原Galaxy schedule
  - URL: https://akihabara-galaxy.com/schedule/
  - Notes: live house schedule. Include normal live events when date, venue, price, and performers are clear.

- 秋葉原CLUB GOODMAN schedule
  - URL: https://goodman2020.com/schedule/
  - Notes: live house schedule. Include normal live events when details are complete.

## Aggregator / Discovery Sources

- PR TIMES Akihabara search
  - URL: https://prtimes.jp/topics/keywords/%E7%A7%8B%E8%91%89%E5%8E%9F
  - Notes: good discovery for openings, campaigns, pop-ups. Prefer company/event official page after discovery.

- Google News RSS Akihabara search
  - URL: https://news.google.com/rss/search?q=%E7%A7%8B%E8%91%89%E5%8E%9F&hl=ja&gl=JP&ceid=JP:ja
  - Notes: broad news discovery for Akihabara openings, closures, campaigns, incidents, local changes, and "秋葉原で起こった出来事". Treat as discovery only; open the linked article and prefer primary or official sources before writing.

- Ceek.jp News Akihabara search
  - URL: https://news.ceek.jp/search.cgi?q=%E7%A7%8B%E8%91%89%E5%8E%9F&summary=1
  - Notes: broad news discovery for Akihabara-related articles and local happenings across Japanese news sites. Treat as discovery only; open the linked article and prefer primary or official sources before writing.

- Enjoy Tokyo Akihabara area
  - URL: https://www.enjoytokyo.jp/event/list/area1319/
  - Notes: event discovery. Confirm against official pages when possible.

- Collabo Cafe Akihabara tag
  - URL: https://collabo-cafe.com/events/tag/akihabara/
  - Notes: anime/game collaboration discovery. Prefer linked official store/campaign source.

- WalkerPlus Akihabara event list
  - URL: https://www.walkerplus.com/event_list/ar0313/sc309922d/
  - Notes: useful for workshops and local events. Individual pages may be enough when source attribution is clear; still search official/ticket page.

- AKIBA PC Hotline! 秋葉原情報
  - URL: https://akiba-pc.watch.impress.co.jp/category/info/
  - Notes: high-value discovery for Akihabara openings, closures, spot updates, food, campaigns, sales, gadget launches, and event roundups. Prefer primary/official source after discovery when available.

- AKIBA PC Hotline! イベント
  - URL: https://akiba-pc.watch.impress.co.jp/category/event/
  - Notes: high-value discovery for PC/gadget/hobby events, hands-on demos, store campaigns, and Akihabara event announcements. Confirm event facts before writing.

- X.com (Twitter) Akihabara search
  - URL: https://x.com/search?q=%E7%A7%8B%E8%91%89%E5%8E%9F+%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88&f=live
  - Notes: broad harvestingでは必ず巡回。リアルタイム発見に強い。公式アカウント投稿・速報イベント告知・秋葉原で起こった出来事の一次発見源として使う。ツイート単体は信頼性低いので、公式サイト・公式SNSアカウントへの裏付け必須。`f=live` で新着順。キーワード例: `秋葉原 コラボ`、`秋葉原 ポップアップ`、`秋葉原 オープン`、`秋葉原 閉店`、`秋葉原 ニュース`、`秋葉原 出来事`、`秋葉原 話題`、`アキバ イベント`、`AKIHABARA POP UP`、`ベルサール秋葉原`、`AKIHABARAゲーマーズ本店`、`ボークス秋葉原ホビー天国2`、`書泉ブックタワー`、`アトレ秋葉原`。

## Quick Search Patterns

- `rg -n "<event id>|<event title>|<venue>" data/articles.json`
- Web search: `"<event title>" 秋葉原`
- Web search: `"秋葉原" "出来事" "ニュース"`
- Web search: `"秋葉原" "閉店"`
- Web search: `"秋葉原" "開店"`
- Web search: `"秋葉原" "リニューアル"`
- Web search: `site:<official-domain> "<event keyword>"`
- Web search: `"<venue>" "<date>" "<event keyword>"`
- Web search fallback for X.com: `site:x.com "<event title>" "秋葉原"`
- Web search fallback for X.com: `site:x.com "秋葉原" "POP UP" "2026"`
- Web search fallback for X.com: `site:x.com "秋葉原" "出来事" OR "ニュース" OR "話題"`
