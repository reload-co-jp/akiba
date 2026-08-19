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
    hours: item.hours ?? "",
    image,
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
  .tabs { display: flex; gap: .25rem; padding: 0 .5rem; }
  .tabs button { flex: 1; padding: .4rem; border: 1px solid #eadfce; background: #fff; border-radius: 6px; cursor: pointer; }
  .tabs button[aria-selected="true"] { background: #b94a3a; color: #fff; border-color: #b94a3a; }
  ul { list-style: none; margin: 0; padding: 0; overflow-y: auto; flex: 1; }
  li button { width: 100%; text-align: left; padding: .5rem .75rem; border: none; background: none; cursor: pointer; border-bottom: 1px solid #f1e9dd; font-size: .8125rem; }
  li button:hover { background: #fff7ec; }
  li button.has-comment::after { content: " 💬"; }
  li button[aria-current="true"] { background: #fff0e0; font-weight: bold; }
  .pane-edit { flex: 1; padding: 1rem 1.5rem; overflow-y: auto; }
  .pane-edit h2 { font-size: 1.125rem; margin-top: 0; }
  .pane-edit textarea { width: 100%; min-height: 200px; box-sizing: border-box; padding: .6rem; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
  .pane-edit label { display: block; margin: .75rem 0 .25rem; font-size: .8125rem; color: #8a6f63; }
  .pane-edit select { padding: .4rem .5rem; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
  .detail-box { background: #fff; border: 1px solid #eadfce; border-radius: 8px; padding: .75rem 1rem; margin-bottom: 1rem; font-size: .8125rem; }
  .detail-box dl { display: grid; grid-template-columns: auto 1fr; gap: .25rem .75rem; margin: 0; }
  .detail-box dt { color: #8a6f63; }
  .detail-box dd { margin: 0; color: #24312f; }
  .detail-box img { max-width: 240px; max-height: 160px; object-fit: cover; border-radius: 6px; display: block; margin-bottom: .5rem; }
  .pane-edit button.save { margin-top: .75rem; padding: .5rem 1.25rem; background: #b94a3a; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
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
    <ul id="list"></ul>
  </div>
  <div class="pane-edit" id="edit">
    <p class="empty">左のリストから選択してください</p>
  </div>
</main>
<script>
  let type = "articles"
  let items = []
  let authors = []
  let currentId = null

  const listEl = document.getElementById("list")
  const editEl = document.getElementById("edit")
  const qEl = document.getElementById("q")

  const loadAuthors = async () => {
    if (authors.length > 0) return
    const res = await fetch("/api/authors")
    authors = await res.json()
  }

  const loadList = async () => {
    const res = await fetch("/api/list?type=" + type)
    items = await res.json()
    renderList()
  }

  const renderList = () => {
    const q = qEl.value.trim().toLowerCase()
    const filtered = items.filter((it) =>
      (it.title + " " + it.slug).toLowerCase().includes(q)
    )
    listEl.innerHTML = ""
    for (const it of filtered) {
      const li = document.createElement("li")
      const btn = document.createElement("button")
      btn.textContent = it.title
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

  const selectItem = async (id) => {
    currentId = id
    await loadAuthors()
    const it = items.find((i) => i.id === id)
    renderList()
    const authorOptions = authors
      .map((a) => '<option value="' + a.id + '">' + a.name + "</option>")
      .join("")
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

  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll(".tabs button").forEach((b) => b.setAttribute("aria-selected", "false"))
      btn.setAttribute("aria-selected", "true")
      type = btn.dataset.type
      currentId = null
      editEl.innerHTML = '<p class="empty">左のリストから選択してください</p>'
      loadList()
    }
  })
  qEl.oninput = renderList
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
