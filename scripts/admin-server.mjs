#!/usr/bin/env node
// ローカル専用の簡易管理ツール。articles.json / spots.json の
// editorComment（サイト表示用「編集部コメント」）を編集・保存する。
// Next.js の output:"export" ビルドとは無関係の独立サーバー。
//
// 起動: pnpm admin  (= node scripts/admin-server.mjs)
// アクセス: http://127.0.0.1:4310/
/* global process, console, URL */
import { createServer } from "node:http"
import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, "..", "data")
const PUBLIC_DIR = path.join(__dirname, "..", "public")
const PORT = process.env.PORT ? Number(process.env.PORT) : 4310

const IMAGE_CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
}

const FILES = {
  articles: path.join(DATA_DIR, "articles.json"),
  spots: path.join(DATA_DIR, "spots.json"),
}
const AUTHORS_FILE = path.join(DATA_DIR, "authors.json")
const TAGS_FILE = path.join(DATA_DIR, "tags.json")

const readJson = async (type) => JSON.parse(await readFile(FILES[type], "utf8"))
const writeJson = async (type, data) =>
  writeFile(FILES[type], JSON.stringify(data, null, 2) + "\n", "utf8")

const labelFor = (type, item) => (type === "articles" ? item.title : item.name)

const detailsFor = (type, item, tagsById) => {
  const image = item.image ? { src: item.image.src, alt: item.image.alt ?? "" } : null
  if (type === "articles") {
    return {
      summary: item.summary ?? "",
      publishedAt: item.publishedAt ?? "",
      tags: (item.tagIds ?? []).map((id) => tagsById.get(id) ?? `#${id}`),
      venue: item.event?.venue ?? "",
      image,
    }
  }
  return {
    summary: item.description ?? "",
    category: item.category ?? "",
    address: item.address ?? "",
    access: item.access ?? "",
    hours: item.hours ?? "",
    closed: item.closed ?? "",
    admission: item.admission ?? "",
    website: item.website ?? "",
    lat: item.lat ?? null,
    lng: item.lng ?? null,
    tags: item.tags ?? [],
    aliases: item.aliases ?? [],
    cuisine: item.cuisine ?? [],
    priceRange: item.priceRange ?? "",
    tier: item.tier ?? "",
    image,
  }
}

const SPOT_CATEGORIES = [
  "電気街・PCパーツ",
  "アニメ・マンガ・同人",
  "ゲーム・フィギュア",
  "グルメ・カフェ",
  "ショッピング",
  "フィギュア・模型",
  "イベント・ライブ",
]

const toArray = (s) =>
  String(s ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)

// scripts/geocode-spots.py と同じ設定・境界（秋葉原周辺のバウンディングボックス）
const GEOCODE_ENDPOINT = "https://msearch.gsi.go.jp/address-search/AddressSearch"
const GEOCODE_USER_AGENT = "akiba-live-spots/1.0 (https://akiba.reload.co.jp)"
const GEOCODE_LAT_RANGE = [35.69, 35.71]
const GEOCODE_LNG_RANGE = [139.765, 139.785]

const geocodeAddress = async (address) => {
  const url = `${GEOCODE_ENDPOINT}?q=${encodeURIComponent(address)}`
  let results
  try {
    const res = await fetch(url, { headers: { "User-Agent": GEOCODE_USER_AGENT } })
    results = await res.json()
  } catch (err) {
    return { error: `request failed: ${err}` }
  }
  if (!Array.isArray(results) || results.length === 0) return { error: "no match" }

  const best = results[0]
  const [lng, lat] = best.geometry.coordinates
  const title = best.properties?.title ?? ""
  const inBox =
    lat >= GEOCODE_LAT_RANGE[0] && lat <= GEOCODE_LAT_RANGE[1] &&
    lng >= GEOCODE_LNG_RANGE[0] && lng <= GEOCODE_LNG_RANGE[1]

  return {
    lat: Math.round(lat * 1e6) / 1e6,
    lng: Math.round(lng * 1e6) / 1e6,
    title,
    inBox,
  }
}

const sendJson = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(body))
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = ""
    req.on("data", (chunk) => (raw += chunk))
    req.on("end", () => resolve(raw))
    req.on("error", reject)
  })

const HTML = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<title>編集部コメント管理</title>
<meta name="robots" content="noindex" />
<style>
  :root { color-scheme: light; }
  body { margin: 0; font-family: system-ui, sans-serif; background: #faf6f0; color: #24312f; }
  header { padding: .75rem 1rem; background: #b94a3a; color: #fff; }
  header h1 { margin: 0; font-size: 1rem; }
  main { display: flex; height: calc(100vh - 44px); }
  .pane-list { width: 340px; border-right: 1px solid #eadfce; display: flex; flex-direction: column; }
  .pane-list input[type="search"] { margin: .5rem; padding: .4rem .5rem; border: 1px solid #ccc; border-radius: 6px; }
  .pane-list #categoryFilter, .pane-list #tierFilter, .pane-list #cuisineFilter { margin: 0 .5rem .5rem; padding: .4rem .5rem; border: 1px solid #ccc; border-radius: 6px; font: inherit; width: calc(100% - 1rem); }
  .tabs { display: flex; gap: .25rem; padding: 0 .5rem; }
  .tabs button { flex: 1; padding: .4rem; border: 1px solid #eadfce; background: #fff; border-radius: 6px; cursor: pointer; }
  .tabs button[aria-selected="true"] { background: #b94a3a; color: #fff; border-color: #b94a3a; }
  ul { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; }
  li button { width: 100%; text-align: left; padding: .5rem .75rem; border: none; background: none; cursor: pointer; border-bottom: 1px solid #f1e9dd; font-size: .8125rem; }
  li button:hover { background: #fff7ec; }
  li button.has-comment::after { content: " 💬"; }
  .tier-badge { display: inline-block; font-size: .625rem; font-weight: bold; line-height: 1.4; padding: 0 .35rem; border-radius: 4px; margin-right: .35rem; }
  .tier-badge.tier-a { background: #dff0e6; color: #2f6b4f; }
  .tier-badge.tier-b { background: #eee; color: #888; }
  li button[aria-current="true"] { background: #fff0e0; font-weight: bold; }
  .pane-edit { flex: 1; padding: 1rem 1.5rem; overflow-y: auto; }
  .pane-edit h2 { font-size: 1.125rem; margin-top: 0; }
  .pane-edit textarea { width: 100%; min-height: 120px; box-sizing: border-box; padding: .6rem; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
  .pane-edit textarea#f-description { min-height: 100px; }
  .pane-edit textarea#comment { min-height: 100px; }
  .pane-edit label { display: block; margin: .75rem 0 .25rem; font-size: .8125rem; color: #8a6f63; }
  .pane-edit select { padding: .4rem .5rem; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
  .pane-edit input { width: 100%; box-sizing: border-box; padding: .4rem .5rem; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
  .detail-box { background: #fff; border: 1px solid #eadfce; border-radius: 8px; padding: .75rem 1rem; margin-bottom: 1rem; font-size: .8125rem; }
  .detail-box dl { display: grid; grid-template-columns: auto 1fr; gap: .25rem .75rem; margin: 0; }
  .detail-box dt { color: #8a6f63; }
  .detail-box dd { margin: 0; color: #24312f; }
  .detail-box img { max-width: 240px; max-height: 160px; object-fit: cover; border-radius: 6px; display: block; margin-bottom: .5rem; }
  .pane-edit button.save { margin-top: .75rem; padding: .5rem 1.25rem; background: #b94a3a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
  .pane-edit button.geocode { padding: .35rem .75rem; background: #fff; color: #b94a3a; border: 1px solid #b94a3a; border-radius: 6px; cursor: pointer; font-size: .8125rem; }
  .status { margin-left: .75rem; font-size: .8125rem; color: #3f5851; }
  .empty { padding: 2rem; color: #8a6f63; }
</style>
</head>
<body>
<header><h1>編集部コメント管理ツール（ローカル専用）</h1></header>
<main>
  <div class="pane-list">
    <div class="tabs" role="tablist">
      <button data-type="articles" aria-selected="true">記事</button>
      <button data-type="spots" aria-selected="false">スポット</button>
    </div>
    <input type="search" id="q" placeholder="タイトル・スラッグで検索" />
    <select id="categoryFilter" style="display:none;"></select>
    <select id="tierFilter" style="display:none;"></select>
    <select id="cuisineFilter" style="display:none;"></select>
    <ul id="list"></ul>
  </div>
  <div class="pane-edit" id="edit">
    <p class="empty">左のリストから選択してください</p>
  </div>
</main>
<script>
  const SPOT_CATEGORIES = [
    "電気街・PCパーツ", "アニメ・マンガ・同人", "ゲーム・フィギュア",
    "グルメ・カフェ", "ショッピング", "フィギュア・模型", "イベント・ライブ",
  ]

  // lib/spots.ts の cuisineLabels と同期させること
  const CUISINE_LABELS = {
    maid_cafe: "メイドカフェ", collab_cafe: "コラボカフェ", cat_cafe: "猫カフェ",
    cafe: "カフェ", izakaya: "居酒屋", bar: "バー", ramen: "ラーメン店",
    noodle: "麺類店", soba: "そば店", udon: "うどん店", sushi: "寿司店",
    japanese: "和食店", chinese: "中華料理店", curry: "カレー店",
    italian: "イタリアン", french: "フレンチ", korean: "韓国料理店",
    indian: "インド料理店", thai: "タイ料理店", vietnamese: "ベトナム料理店",
    mexican: "メキシコ料理店", spanish: "スペイン料理店", american: "アメリカン料理店",
    asian: "アジア料理店", international: "各国料理店", regional: "郷土料理店",
    yakiniku: "焼肉店", tonkatsu: "とんかつ店", chicken: "鶏料理店",
    takoyaki: "たこ焼き店", fried_food: "揚げ物店", western: "洋食店",
    tempura: "天ぷら店", steak: "ステーキ店", seafood: "海鮮料理店",
    fish: "魚料理店", unagi: "うなぎ店", donburi: "丼もの店", beef_bowl: "牛丼店",
    gyoza: "餃子店", okonomiyaki: "お好み焼き店", yakisoba: "焼きそば店",
    shabu_shabu: "しゃぶしゃぶ店", sukiyaki: "すき焼き店", teppanyaki: "鉄板焼き店",
    hot_pot: "鍋料理店", oden: "おでん店", pizza: "ピザ店", burger: "ハンバーガー店",
    sandwich: "サンドイッチ店", kebab: "ケバブ店", sweets: "スイーツ店",
    crepe: "クレープ店", bubble_tea: "タピオカ店",
  }
  const cuisineLabel = (key) => CUISINE_LABELS[key] ?? key

  let type = "articles"
  let items = []
  let authors = []
  let currentId = null

  const listEl = document.getElementById("list")
  const editEl = document.getElementById("edit")
  const qEl = document.getElementById("q")
  const categoryFilterEl = document.getElementById("categoryFilter")
  const tierFilterEl = document.getElementById("tierFilter")
  const cuisineFilterEl = document.getElementById("cuisineFilter")

  const loadAuthors = async () => {
    if (authors.length > 0) return
    const res = await fetch("/api/authors")
    authors = await res.json()
  }

  const loadList = async () => {
    const res = await fetch("/api/list?type=" + type)
    items = await res.json()
    if (type === "spots") {
      const prevCuisine = cuisineFilterEl.value
      const cuisines = new Set()
      for (const it of items) (it.details?.cuisine || []).forEach((c) => cuisines.add(c))
      cuisineFilterEl.innerHTML =
        '<option value="">料理ジャンル: すべて</option>' +
        [...cuisines]
          .sort((a, b) => cuisineLabel(a).localeCompare(cuisineLabel(b), "ja"))
          .map((c) => '<option value="' + c + '">' + escapeHtml(cuisineLabel(c)) + "</option>")
          .join("")
      // 再構築で選択がリセットされるので、保存前のジャンルがまだ存在するなら戻す
      if (cuisines.has(prevCuisine)) cuisineFilterEl.value = prevCuisine
    }
    renderList()
  }

  const renderList = () => {
    const q = qEl.value.trim().toLowerCase()
    const category = categoryFilterEl.value
    const tier = tierFilterEl.value
    const cuisine = cuisineFilterEl.value
    const filtered = items.filter(
      (it) =>
        (it.title + " " + it.slug).toLowerCase().includes(q) &&
        (!category || it.details?.category === category) &&
        (!tier || (it.details?.tier === "B" ? "B" : "A") === tier) &&
        (!cuisine || (it.details?.cuisine || []).includes(cuisine))
    )
    listEl.innerHTML = ""
    for (const it of filtered) {
      const li = document.createElement("li")
      const btn = document.createElement("button")
      const tierBadge =
        type === "spots"
          ? '<span class="tier-badge tier-' + (it.details?.tier === "B" ? "b" : "a") + '">' +
            (it.details?.tier === "B" ? "B" : "A") + "</span>"
          : ""
      btn.innerHTML = tierBadge + escapeHtml(it.title)
      btn.className = it.editorComment?.text ? "has-comment" : ""
      btn.setAttribute("aria-current", String(it.id === currentId))
      btn.onclick = () => selectItem(it.id)
      li.appendChild(btn)
      listEl.appendChild(li)
    }
  }

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))

  const detailRows = (it) => {
    const d = it.details || {}
    const rows =
      type === "articles"
        ? [
            ["公開日", d.publishedAt],
            ["タグ", (d.tags || []).join(", ")],
            ["会場", d.venue],
          ]
        : [
            ["カテゴリ", d.category],
            ["住所", d.address],
            ["営業時間", d.hours],
          ]
    return rows
      .filter(([, v]) => v)
      .map(([k, v]) => "<dt>" + escapeHtml(k) + "</dt><dd>" + escapeHtml(v) + "</dd>")
      .join("")
  }

  const field = (id, label, value, opts) => {
    opts = opts || {}
    const required = opts.required ? " required" : ""
    // input は value 属性、textarea は中身に値を入れる
    const html = opts.textarea
      ? '<textarea id="' + id + '"' + required + ">" + escapeHtml(value ?? "") + "</textarea>"
      : '<input id="' + id + '" type="' + (opts.type || "text") + '"' +
        (opts.step ? ' step="' + opts.step + '"' : "") +
        ' value="' + escapeHtml(value ?? "") + '"' + required + " />"
    return '<label for="' + id + '">' + escapeHtml(label) + "</label>" + html
  }

  const selectItem = async (id) => {
    currentId = id
    await loadAuthors()
    const it = items.find((i) => i.id === id)
    renderList()
    const authorOptions = authors
      .map((a) => '<option value="' + a.id + '">' + a.name + "</option>")
      .join("")

    if (type === "articles") {
      const summary = it.details?.summary || ""
      const image = it.details?.image
      const imageHtml = image
        ? '<img src="' + escapeHtml(image.src) + '" alt="' + escapeHtml(image.alt) + '" />'
        : ""
      editEl.innerHTML =
        '<h2></h2><p style="color:#8a6f63;font-size:.8125rem"></p>' +
        '<div class="detail-box">' +
        imageHtml +
        '<dl>' + detailRows(it) + '</dl>' +
        (summary ? '<p style="margin:.5rem 0 0">' + escapeHtml(summary) + '</p>' : '') +
        '</div>' +
        '<textarea id="comment" placeholder="編集部コメント（空欄で非表示）"></textarea>' +
        '<label for="author">担当者</label>' +
        '<select id="author"><option value="">未設定</option>' + authorOptions + '</select><br />' +
        '<button class="save">保存</button><span class="status" id="status"></span>'
      editEl.querySelector("h2").textContent = it.title
      editEl.querySelector("p").textContent = "slug: " + it.slug
      editEl.querySelector("#comment").value = it.editorComment?.text || ""
      editEl.querySelector("#author").value = it.editorComment?.authorId ?? ""
      editEl.querySelector(".save").onclick = () => saveComment(id)
      return
    }

    // スポット: 詳細フィールドをまとめて編集
    const d = it.details || {}
    const image = d.image
    const imageHtml = image
      ? '<img src="' + escapeHtml(image.src) + '" alt="' + escapeHtml(image.alt) + '" />'
      : ""
    const categoryOptions = SPOT_CATEGORIES
      .map((c) => '<option value="' + c + '"' + (c === d.category ? " selected" : "") + ">" + c + "</option>")
      .join("")

    editEl.innerHTML =
      '<h2></h2><p style="color:#8a6f63;font-size:.8125rem"></p>' +
      (imageHtml ? '<div class="detail-box">' + imageHtml + '</div>' : '') +
      field("f-name", "名称", d.name ?? it.title, { required: true }) +
      '<label for="f-category">カテゴリ</label><select id="f-category">' + categoryOptions + '</select>' +
      field("f-description", "説明", d.summary, { textarea: true, required: true }) +
      field("f-address", "住所", d.address) +
      field("f-access", "アクセス", d.access) +
      field("f-hours", "営業時間", d.hours) +
      field("f-closed", "定休日", d.closed) +
      field("f-admission", "料金", d.admission) +
      field("f-website", "公式サイト", d.website, { type: "url" }) +
      '<button type="button" class="geocode" style="margin-top:.5rem">住所から緯度経度を取得</button>' +
      '<span class="status" id="geocodeStatus"></span>' +
      field("f-lat", "緯度", d.lat, { type: "number", step: "0.000001" }) +
      field("f-lng", "経度", d.lng, { type: "number", step: "0.000001" }) +
      field("f-tags", "タグ（カンマ区切り）", (d.tags || []).join(", ")) +
      field("f-aliases", "別名（カンマ区切り）", (d.aliases || []).join(", ")) +
      field("f-cuisine", "料理ジャンル（カンマ区切り）", (d.cuisine || []).join(", ")) +
      field("f-priceRange", "価格帯", d.priceRange) +
      '<label for="f-tier">掲載レベル</label><select id="f-tier">' +
      '<option value=""' + (d.tier !== "B" ? " selected" : "") + '>A（詳細ページあり）</option>' +
      '<option value="B"' + (d.tier === "B" ? " selected" : "") + '>B（一覧のみ）</option>' +
      '</select>' +
      '<label for="comment">編集部コメント</label>' +
      '<textarea id="comment" placeholder="編集部コメント（空欄で非表示）"></textarea>' +
      '<label for="author">担当者</label>' +
      '<select id="author"><option value="">未設定</option>' + authorOptions + '</select><br />' +
      '<button class="save">保存</button><span class="status" id="status"></span>'
    editEl.querySelector("h2").textContent = it.title
    editEl.querySelector("p").textContent = "slug: " + it.slug
    editEl.querySelector("#comment").value = it.editorComment?.text || ""
    editEl.querySelector("#author").value = it.editorComment?.authorId ?? ""
    editEl.querySelector(".save").onclick = () => saveSpot(id)
    editEl.querySelector(".geocode").onclick = () => geocodeSpot()
  }

  const geocodeSpot = async () => {
    const address = editEl.querySelector("#f-address").value.trim()
    const statusEl = editEl.querySelector("#geocodeStatus")
    if (!address) {
      statusEl.textContent = "住所を入力してください"
      return
    }
    statusEl.textContent = "検索中…"
    const res = await fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
    const result = await res.json()
    if (!res.ok) {
      statusEl.textContent = "取得失敗: " + (result.error || res.status)
      return
    }
    if (!result.inBox) {
      statusEl.textContent =
        "秋葉原周辺の範囲外: " + result.lat + "," + result.lng +
        "（" + result.title + "）— 未反映。手動で確認のうえ必要なら入力してください"
      return
    }
    editEl.querySelector("#f-lat").value = result.lat
    editEl.querySelector("#f-lng").value = result.lng
    statusEl.textContent = "反映しました: " + result.lat + "," + result.lng + "（" + result.title + "）"
  }

  const saveSpot = async (id) => {
    const val = (sel) => editEl.querySelector(sel).value
    const statusEl = editEl.querySelector("#status")
    const authorIdRaw = val("#author")
    const body = {
      id,
      name: val("#f-name"),
      category: val("#f-category"),
      description: val("#f-description"),
      address: val("#f-address"),
      access: val("#f-access"),
      hours: val("#f-hours"),
      closed: val("#f-closed"),
      admission: val("#f-admission"),
      website: val("#f-website"),
      lat: val("#f-lat"),
      lng: val("#f-lng"),
      tags: val("#f-tags"),
      aliases: val("#f-aliases"),
      cuisine: val("#f-cuisine"),
      priceRange: val("#f-priceRange"),
      tier: val("#f-tier"),
      editorComment: {
        text: val("#comment"),
        authorId: authorIdRaw ? Number(authorIdRaw) : undefined,
      },
    }
    statusEl.textContent = "保存中…"
    const res = await fetch("/api/spot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      statusEl.textContent = "保存しました"
      await loadList()
    } else {
      statusEl.textContent = "保存失敗: " + (await res.text())
    }
  }

  const saveComment = async (id) => {
    const text = editEl.querySelector("#comment").value
    const authorIdRaw = editEl.querySelector("#author").value
    const authorId = authorIdRaw ? Number(authorIdRaw) : undefined
    const statusEl = editEl.querySelector("#status")
    statusEl.textContent = "保存中…"
    const res = await fetch("/api/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, text, authorId }),
    })
    if (res.ok) {
      const it = items.find((i) => i.id === id)
      it.editorComment = text.trim() ? { text, authorId } : undefined
      statusEl.textContent = "保存しました"
      renderList()
    } else {
      statusEl.textContent = "保存失敗: " + (await res.text())
    }
  }

  categoryFilterEl.innerHTML =
    '<option value="">カテゴリ: すべて</option>' +
    SPOT_CATEGORIES.map((c) => '<option value="' + c + '">' + c + "</option>").join("")
  tierFilterEl.innerHTML =
    '<option value="">掲載レベル: すべて</option>' +
    '<option value="A">A（詳細ページあり）</option>' +
    '<option value="B">B（一覧のみ）</option>'

  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", "false"))
      btn.setAttribute("aria-selected", "true")
      type = btn.dataset.type
      currentId = null
      editEl.innerHTML = '<p class="empty">左のリストから選択してください</p>'
      categoryFilterEl.value = ""
      categoryFilterEl.style.display = type === "spots" ? "" : "none"
      tierFilterEl.value = ""
      tierFilterEl.style.display = type === "spots" ? "" : "none"
      cuisineFilterEl.value = ""
      cuisineFilterEl.style.display = type === "spots" ? "" : "none"
      loadList()
    }
  })
  qEl.oninput = renderList
  categoryFilterEl.onchange = renderList
  tierFilterEl.onchange = renderList
  cuisineFilterEl.onchange = renderList
  loadList()
</script>
</body>
</html>
`

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost")

  try {
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
      res.end(HTML)
      return
    }

    if (req.method === "GET" && url.pathname.startsWith("/images/")) {
      const ext = path.extname(url.pathname).toLowerCase()
      const contentType = IMAGE_CONTENT_TYPES[ext]
      if (!contentType) return res.writeHead(404).end("Not found")
      const filePath = path.join(PUBLIC_DIR, path.normalize(url.pathname))
      if (!filePath.startsWith(PUBLIC_DIR + path.sep)) return res.writeHead(400).end("Bad request")
      try {
        const file = await readFile(filePath)
        res.writeHead(200, { "Content-Type": contentType })
        res.end(file)
      } catch {
        res.writeHead(404)
        res.end("Not found")
      }
      return
    }

    if (req.method === "GET" && url.pathname === "/api/authors") {
      const authors = JSON.parse(await readFile(AUTHORS_FILE, "utf8"))
      sendJson(res, 200, authors)
      return
    }

    if (req.method === "GET" && url.pathname === "/api/list") {
      const type = url.searchParams.get("type")
      if (type !== "articles" && type !== "spots") return sendJson(res, 400, { error: "invalid type" })
      const data = await readJson(type)
      const tags = JSON.parse(await readFile(TAGS_FILE, "utf8"))
      const tagsById = new Map(tags.map((t) => [t.id, t.name]))
      sendJson(
        res,
        200,
        // JSON配列の並び順 = 追加順（末尾が最新）なので、逆順にして最新追加を先頭に出す。
        [...data].reverse().map((item) => ({
          id: item.id,
          title: labelFor(type, item),
          slug: item.slug,
          editorComment: item.editorComment ?? null,
          details: detailsFor(type, item, tagsById),
        })),
      )
      return
    }

    if (req.method === "POST" && url.pathname === "/api/comment") {
      const body = JSON.parse(await readBody(req))
      const { type, id, text, authorId } = body
      if (type !== "articles" && type !== "spots") return sendJson(res, 400, { error: "invalid type" })
      const data = await readJson(type)
      const item = data.find((i) => i.id === id)
      if (!item) return sendJson(res, 404, { error: "not found" })
      if (text && text.trim()) {
        item.editorComment = {
          text,
          ...(authorId != null && { authorId }),
        }
      } else {
        delete item.editorComment
      }
      await writeJson(type, data)
      sendJson(res, 200, { ok: true })
      return
    }

    if (req.method === "POST" && url.pathname === "/api/geocode") {
      const { address } = JSON.parse(await readBody(req))
      if (!address || !address.trim()) return sendJson(res, 400, { error: "address required" })
      const result = await geocodeAddress(address)
      sendJson(res, result.error ? 502 : 200, result)
      return
    }

    if (req.method === "POST" && url.pathname === "/api/spot") {
      const body = JSON.parse(await readBody(req))
      const { id, name, category, description, address, access, hours, closed,
        admission, website, lat, lng, tags, aliases, cuisine, priceRange, tier,
        editorComment } = body
      if (typeof id !== "number") return sendJson(res, 400, { error: "invalid id" })
      if (!name || !description) return sendJson(res, 400, { error: "name/description required" })
      if (!SPOT_CATEGORIES.includes(category)) return sendJson(res, 400, { error: "invalid category" })

      const data = await readJson("spots")
      const item = data.find((i) => i.id === id)
      if (!item) return sendJson(res, 404, { error: "not found" })

      item.name = name
      item.category = category
      item.description = description

      const setOrDelete = (key, value) => {
        if (value === "" || value == null) delete item[key]
        else item[key] = value
      }
      setOrDelete("address", address)
      setOrDelete("access", access)
      setOrDelete("hours", hours)
      setOrDelete("closed", closed)
      setOrDelete("admission", admission)
      setOrDelete("website", website)
      setOrDelete("priceRange", priceRange)
      setOrDelete("tier", tier === "B" ? "B" : "")

      const latNum = lat === "" || lat == null ? null : Number(lat)
      const lngNum = lng === "" || lng == null ? null : Number(lng)
      setOrDelete("lat", Number.isFinite(latNum) ? latNum : null)
      setOrDelete("lng", Number.isFinite(lngNum) ? lngNum : null)

      const tagsArr = toArray(tags)
      const aliasesArr = toArray(aliases)
      const cuisineArr = toArray(cuisine)
      if (tagsArr.length) item.tags = tagsArr
      else delete item.tags
      if (aliasesArr.length) item.aliases = aliasesArr
      else delete item.aliases
      if (cuisineArr.length) item.cuisine = cuisineArr
      else delete item.cuisine

      if (editorComment?.text && editorComment.text.trim()) {
        item.editorComment = {
          text: editorComment.text,
          ...(editorComment.authorId != null && { authorId: editorComment.authorId }),
        }
      } else {
        delete item.editorComment
      }

      await writeJson("spots", data)
      sendJson(res, 200, { ok: true })
      return
    }

    res.writeHead(404)
    res.end("Not found")
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: String(err) })
  }
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`編集部コメント管理ツール起動: http://127.0.0.1:${PORT}/`)
})
