/**
 * 記事画像の width/height を抽出して articles.json に追記するスクリプト
 * 使い方: node scripts/update-image-dimensions.mjs
 */
/* global console */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { execSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const articlesPath = join(root, "data/articles.json")
const publicPath = join(root, "public")

const getImageDimensions = (src) => {
  if (!src || src.startsWith("http")) return null
  const fullPath = join(publicPath, src)
  if (!existsSync(fullPath)) return null
  try {
    const out = execSync(`file "${fullPath}"`, { encoding: "utf8" })
    const m = out.match(/(\d+)x(\d+)/)
    if (!m) return null
    return { width: parseInt(m[1]), height: parseInt(m[2]) }
  } catch {
    return null
  }
}

const articles = JSON.parse(readFileSync(articlesPath, "utf8"))

let updated = 0
let tooSmall = []

for (const article of articles) {
  if (!article.image?.src) continue
  const dims = getImageDimensions(article.image.src)
  if (!dims) continue

  const changed =
    article.image.width !== dims.width || article.image.height !== dims.height
  if (changed) {
    article.image.width = dims.width
    article.image.height = dims.height
    updated++
  }

  if (dims.width < 1200) {
    tooSmall.push({ slug: article.slug, width: dims.width, height: dims.height, src: article.image.src })
  }
}

writeFileSync(articlesPath, JSON.stringify(articles, null, 2) + "\n")

console.log(`更新: ${updated} 件`)
console.log(`1200px未満: ${tooSmall.length} 件`)
if (tooSmall.length > 0) {
  console.log("\n--- 1200px未満の記事 ---")
  for (const { slug, width, height } of tooSmall) {
    console.log(`  ${width}x${height}  ${slug}`)
  }
}
