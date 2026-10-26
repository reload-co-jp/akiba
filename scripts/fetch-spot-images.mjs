/**
 * data/spots.json のうち image を持たないスポットに、
 * Wikimedia Commons から写真を取得して public/images/spots/ へ保存し、
 * spots.json の image フィールドを補完するスクリプト。
 *
 * 優先度: detail page を持つ tier A スポット → tier B（一覧のみ）の順。
 * 見つからなかったスポットはレポートのみ出力し、スキップする。
 *
 * 使い方:
   node scripts/fetch-spot-images.mjs              # レポートのみ（dry-run）
   node scripts/fetch-spot-images.mjs --write      # 実際に取得・書き込み
   node scripts/fetch-spot-images.mjs --write --tier A --limit 20
 */
/* global process, console, setTimeout, Buffer */
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPOTS_JSON = join(__dirname, "..", "data", "spots.json")
const PUBLIC_DIR = join(__dirname, "..", "public", "images", "spots")

const UA =
  "AkibaLive/1.0 (https://akiba.live; contact@example.com) spot-image-fetcher"
const COMMONS = "https://commons.wikimedia.org/w/api.php"
const DELAY_MS = 2000 // Wikimedia に配慮して 1 リクエスト/秒未満に抑える
const MAX_SEARCH_RESULTS = 8

// 画像として採用しない拡張子（SVG 等はスポットカードに向かない）
const SKIP_EXTENSIONS = new Set(["svg", "webp"])

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function searchQuery(spot) {
  // スポット名 + 秋葉原 で Commons 内を検索。チェーン店など同名複数拠点
  // に備え「秋葉原」を必ず含める。
  return `${spot.name} 秋葉原`
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

/**
 * Commons でスポットに該当しそうなファイルを検索し、最もらしい1件を返す。
 */
async function findImage(spot, query) {
  const srsearch = query
  const searchUrl =
    COMMONS +
    `?action=query&list=search&srsearch=${encodeURIComponent(
      srsearch
    )}&srnamespace=6&format=json&srlimit=${MAX_SEARCH_RESULTS}`
  const data = await fetchJson(searchUrl)
  const hits = data.query?.search ?? []
  if (hits.length === 0) return null

  // タイトルからファイル名を抽出して imageinfo を一括取得
  const titles = hits.map((h) => h.title).join("|")
  const iiUrl =
    COMMONS +
    `?action=query&titles=${encodeURIComponent(titles)}&prop=imageinfo&iiprop=url|size|extmetadata&format=json`
  const iiData = await fetchJson(iiUrl)
  const pages = iiData.query?.pages ?? {}

  const candidates = []
  for (const pageid of Object.keys(pages)) {
    const page = pages[pageid]
    const infos = page.imageinfo ?? []
    for (const info of infos) {
      const ext = (info.url ?? "").split(".").pop()?.toLowerCase() ?? ""
      if (SKIP_EXTENSIONS.has(ext)) continue
      if (!info.width || !info.height) continue
      // 小さすぎる画像（アイコン類）は除く
      if (info.width < 600 || info.height < 400) continue
      const em = info.extmetadata ?? {}
      const license = (em.LicenseShortName && em.LicenseShortName.value) || ""
      candidates.push({
        title: page.title,
        pageid: +pageid,
        url: info.url,
        descriptionurl: info.descriptionurl,
        width: info.width,
        height: info.height,
        license,
        description: (em.ImageDescription && em.ImageDescription.value) || "",
        snippet: hits.find((h) => h.title === page.title)?.snippet ?? "",
      })
    }
  }

  // スポット名と関連性がある候補だけを残す（街並み写真や別の店を除外）
  const relevant = candidates.filter((c) => isRelevant(spot, c))
  if (relevant.length === 0) return null

  // CC BY / CC BY-SA を優先し、次いで大きい画像を優先
  const rank = (c) => {
    const l = c.license.toLowerCase()
    if (l.includes("cc-by-sa")) return 3
    if (l.includes("cc-by")) return 2
    if (l.includes("cc0")) return 2
    if (l) return 1
    return 0
  }
  relevant.sort(
    (a, b) => rank(b) - rank(a) || b.width * b.height - a.width * a.height
  )
  return relevant[0]
}


const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

async function downloadImage(url, destPath) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": BROWSER_UA,
      Referer: "https://commons.wikimedia.org/",
    },
  })
  if (!res.ok) throw new Error(`download HTTP ${res.status}`)
  const ct = res.headers.get("content-type") ?? ""
  let ext = "jpg"
  if (ct.includes("jpeg")) ext = "jpg"
  else if (ct.includes("png")) ext = "png"
  else if (ct.includes("gif")) ext = "gif"
  else if (ct.includes("webp")) ext = "webp"
  const buf = Buffer.from(await res.arrayBuffer())
  mkdirSync(join(destPath, ".."), { recursive: true })
  writeFileSync(destPath, buf)
  return { ext, bytes: buf.length }
}

function buildSourceLabel(license) {
  return `Wikimedia Commons (${license || "CC"})`
}

// スポット名から「画像タイトルに現れるはずの」固有キーワードを抽出。
// 「秋葉原」「本店」などの共通語は除外し、誤マッチ（別の店や街並み写真）を減らす。
const STOP_WORDS = new Set([
  "秋葉原", "アキバ", "AKIBA", "Akihabara", "akihabara",
  "神田", "末広町", "岩本町", "淡路町", "御茶ノ水",
  "店", "本店", "支店", "店舗", "駅前店", "号店", "館", "センター", "ビル"
])

function contentKeywords(name) {
  return name
    .split(/[\s・･\-–—/[\]()（）]+/)
    .flatMap((w) => {
      const wk = w.replace(/[\s]+/g, "")
      if (!wk || STOP_WORDS.has(wk)) return []
      return wk.length >= 2 ? [wk] : []
    })
    .filter((w, i, arr) => arr.indexOf(w) === i)
}

function isRelevant(spot, candidate) {
  const keywords = contentKeywords(spot.name)
  if (keywords.length === 0) return false
  // 画像タイトル（ファイル名）に固有キーワードがあることだけを採用。
  // 説明文に店名が紛れ込むだけの街並み写真などを除外する。
  const title = candidate.title.toLowerCase()
  return keywords.some((k) => title.includes(k.toLowerCase()))
}

async function main() {
  const write = process.argv.includes("--write")
  const tierIdx = process.argv.indexOf("--tier")
  const tierFilter = tierIdx !== -1 ? process.argv[tierIdx + 1] : null
  const limitIdx = process.argv.indexOf("--limit")
  const limit = limitIdx !== -1 ? +process.argv[limitIdx + 1] : Infinity

  const spots = JSON.parse(readFileSync(SPOTS_JSON, "utf8"))
  const noImage = spots.filter((s) => !s.image || !s.image.src)
  const target = noImage
    .filter((s) => !tierFilter || s.tier === tierFilter)
    .slice(0, limit)

  console.log(
    `対象スポット: ${target.length} 件 (imageなし, tier=${tierFilter || "全部"}, limit=${limit === Infinity ? "∞" : limit})`
  )
  if (!write) {
    console.log(
      "(dry-run: 実際の取得・書き込みは行いません。--write を付けて実行してください)\n"
    )
  }

  let success = 0
  let skipped = 0
  const failed = []
  const updated = [...spots]

  for (let i = 0; i < target.length; i++) {
    const spot = target[i]
    const slug = spot.slug
    console.log(
      `[${i + 1}/${target.length}] ${slug} ${spot.name} (tier ${spot.tier})`
    )

    let image
    try {
      // 「◯◯ 秋葉原」で Commons を検索。関連する写真がなければスキップする。
      image = await findImage(spot, searchQuery(spot))
    } catch (err) {
      console.log(`  ⚠ 検索エラー: ${err.message}`)
      failed.push({ slug, error: err.message })
      skipped++
      await sleep(DELAY_MS)
      continue
    }

    if (!image) {
      console.log(`  − Commons に該当画像なし`)
      skipped++
      await sleep(DELAY_MS)
      continue
    }

    console.log(
      `  → ${image.title} (${image.width}x${image.height}) ${image.license} / ${image.artist}`
    )

    if (!write) {
      success++
      await sleep(DELAY_MS)
      continue
    }

    // 画像をダウンロードして保存
    const pathPart = image.url.split("?")[0]
    const ext = (pathPart.split(".").pop() ?? "jpg").toLowerCase()
    const fileExt = SKIP_EXTENSIONS.has(ext) ? "jpg" : ext
    const destName = `${slug}.${fileExt}`
    const destPath = join(PUBLIC_DIR, destName)
    try {
      await downloadImage(image.url, destPath)
    } catch (err) {
      console.log(`  ⚠ ダウンロード失敗: ${err.message}`)
      failed.push({ slug, error: err.message })
      skipped++
      await sleep(DELAY_MS)
      continue
    }

    const spotIndex = updated.findIndex((s) => s.id === spot.id)
    if (spotIndex === -1) {
      console.log(`  ⚠ spots.json に該当レコードなし`)
      skipped++
      await sleep(DELAY_MS)
      continue
    }

    updated[spotIndex].image = {
      src: `/images/spots/${destName}`,
      alt: `${spot.name}の外観`,
      width: image.width,
      height: image.height,
      sourceLabel: buildSourceLabel(image.license),
      sourceUrl: image.descriptionurl,
    }
    success++
    console.log(`  ✓ 保存完了: ${destName}`)

    // リクエスト間隔を開ける（検索2回 + ダウンロード1回 あるため余裕を持つ）
    await sleep(DELAY_MS)
  }

  if (write) {
    writeFileSync(SPOTS_JSON, JSON.stringify(updated, null, 2) + "\n", "utf8")
    console.log(`\nspots.json を更新しました (${success} 件追加)`)
  }

  console.log(`\n=== 結果 ===`)
  console.log(`成功: ${success} / スキップ: ${skipped}`)
  if (failed.length) {
    console.log(`\n失敗:`)
    for (const f of failed) console.log(`  - ${f.slug}: ${f.error}`)
  }
  if (!write) {
    console.log(`\n--write を付けると実際に取得・保存します。`)
  }
}

main().catch((err) => {
  console.error("FATAL:", err)
  process.exit(1)
})
