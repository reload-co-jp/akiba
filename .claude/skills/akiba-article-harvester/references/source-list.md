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
  - Notes: strong source for AKIHABARAゲーマーズ本店 fairs and pop-up shops, but gamers.co.jp returns 403 to this environment for every page (as of 2026-11). `harvest.py` covers it with the `gnews_gamers` Google News query ("AKIHABARAゲーマーズ", last 30 days). Confirm facts on the PR TIMES release or another reachable page. Don't try to get past the block.

- アニメイト オンリーショップ / グラッテ（アニメイト秋葉原）
  - URL: https://www.animate.co.jp/onlyshop/search/relation_shop:218/ and https://www.animate.co.jp/gratte/search/relation_shop:218/
  - Notes: official animate.co.jp lists filtered to アニメイト秋葉原 (`harvest.py list animate_onlyshop` / `animate_gratte`). Detail pages list the target stores and periods. Check that the Akihabara store (1号館/2号館/ANNEX) is among them. The old source, animate-onlineshop.jp/contents/fair_event/, returns an "アクセス制限" 403 page and was dropped.

- あみあみ実店舗イベント
  - URL: https://realstore.amiami.jp/event/
  - Notes: primary source for あみあみ秋葉原ラジオ会館店 and あみあみ秋葉原フィギュアタワー店 events. It sits behind a Cloudflare challenge that blocks this environment, so `harvest.py` uses the `gnews_amiami` Google News query ("あみあみ秋葉原", last 30 days) instead. Confirm with HOBBY Watch, PR TIMES or other reachable coverage.

- コトブキヤ イベント一覧
  - URL: https://www.kotobukiya.co.jp/event/
  - Notes: source for コトブキヤ秋葉原館 events, exhibitions, campaigns and limited sales. It sits behind a Cloudflare challenge that blocks this environment, so `harvest.py` uses the `gnews_kotobukiya` Google News query ("コトブキヤ秋葉原館", last 30 days). collabocafe also covers most 秋葉原館 pop-ups.

- MOGRA 秋葉原
  - URL: https://club-mogra.jp/
  - Notes: source for anime song, game music, Touhou, DJ, and club events at 秋葉原MOGRA. Include normal live/DJ events when date, venue, price, and visitor value are clear.

- 秋葉原CLUB GOODMAN schedule
  - URL: https://club.goodman2020.com/events (old goodman2020.com/schedule/ 404s — schedule moved to the `club.` subdomain)
  - Notes: live house schedule. Include normal live events when details are complete. Works well via `harvest.py list club_goodman`.

- ボークス秋葉原ホビー天国2 店舗ブログ
  - URL: https://www.volks.co.jp/blog_sr/akiba2/
  - Notes: 一次情報源. POP UP SHOP and 6F/7F event-floor announcements (タイトルに「お知らせ」等のカテゴリと日付付き). Skip contest entry-showcase posts (ファレホペイントコンテスト作品紹介 etc.). `harvest.py list volks_akiba2`.

- マーチエキュート神田万世橋 event
  - URL: https://www.ecute.jp/maach/
  - Notes: フェア・謎解き・ポップアップ. Skip JRE POINT 常設キャンペーン. `harvest.py list maach`.

- 2k540 AKI-OKA ARTISAN info
  - URL: https://www.jrtk.jp/2k540/
  - Notes: 御徒町〜秋葉原高架下. 展示・創業祭・ショップ開店. `harvest.py list 2k540`. As of 2026-11-20 every jrtk.jp page redirects to a maintenance notice (サービス一時停止), so it lists 0 items. Kept because it is temporary.

- 秋葉原電気街振興会 (akiba.or.jp)
  - URL: https://akiba.or.jp/
  - Notes: 【地域のイベント情報】【電気街からのお知らせ】— local festivals, 歩行者天国/社会実験, おもてなしフェア etc. Only a few posts per month. `harvest.py list akiba_or_jp`.

## Aggregator / Discovery Sources

- PR TIMES Akihabara search
  - URL: https://prtimes.jp/topics/keywords/%E7%A7%8B%E8%91%89%E5%8E%9F
  - Notes: good discovery for openings, campaigns, pop-ups. Prefer company/event official page after discovery.

- Google News RSS Akihabara search
  - URL: https://news.google.com/rss/search?q=%E7%A7%8B%E8%91%89%E5%8E%9F&hl=ja&gl=JP&ceid=JP:ja
  - Notes: broad news discovery for Akihabara openings, closures, campaigns, incidents, local changes, and "秋葉原で起こった出来事". Treat as discovery only; open the linked article and prefer primary or official sources before writing.

- Google News RSS venue queries
  - `gnews_bellesalle` ("ベルサール秋葉原"), `gnews_udx` ("秋葉原UDX"), `gnews_gigo` ("GiGO秋葉原"), each limited to the last 30 days.
  - Notes: these large event venues have no usable listing of their own (bellesalle.co.jp/event/ has no per-venue links, udx.jp is rarely updated, gigo.co.jp redirects). Resolve each row like any gnews row.

- Enjoy Tokyo Akihabara area
  - URL: https://www.enjoytokyo.jp/event/list/area1319/
  - Notes: event discovery. Confirm against official pages when possible.

- Collabo Cafe Akihabara tag
  - URL: https://collabo-cafe.com/events/tag/akihabara/
  - Notes: anime/game collaboration discovery. Prefer linked official store/campaign source.

- WalkerPlus Tokyo event list (Akihabara-filtered)
  - URL: https://www.walkerplus.com/event_list/ar0313101/chiyoda/ (千代田区 list; Tokyo-wide list gave only ~2 Akiba hits. `harvest.py list walkerplus` pages through it and keeps cards mentioning 秋葉原/神田/御茶ノ水/UDX etc.)
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

## Checked and Not Added (2026-10)

Removed 2026-11 (source audit):

- 秋葉原ZEST (akihabarazest.com/schedule): JS-rendered, always 0 items.
- 秋葉原Galaxy (galaxy-group.jp/akihabara/evt_booking): widget page, always 0 items.
- 千代田区観光協会 (visit-chiyoda.tokyo): mostly 丸の内/日比谷 illuminations; no articles came from it.
- Ceek.jp news search: ~100 rows per pass, almost all off-topic national news (CodeZine, politics, sports); the Akihabara stories it carried were the same ones gnews already returns.
- キュアメイドカフェ news (curemaid.jp): only a handful of posts, mostly hours changes.


- アキバ経済新聞: headlines stopped in 2023 (verified 2026-10).
- 神田明神 news: newest exhibition post is 2025-10 — rarely updated.
- アキバBlog (akibablog.blog.jp): fetchable but mostly 新刊/同人 release posts — too noisy.
- ラジオ会館 店舗ニュース: Python SSL fails (incomplete cert chain); content is mostly 入荷 news (out of scope).
- メロンブックス店舗イベント / とらのあなNEWS: fetchable but chain-wide 新刊フェア — too noisy.
- 秋葉原UDX topics (udx.jp/feed/): reachable via curl only (Python SSL error), rarely updated.
- Peatix search: JS-rendered, 0 links. ベルサール/とらのあな/メロンブックス event URLs 404 (ボークス is covered by the akiba2 store blog, `volks_akiba2`).

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
