import crypto from "node:crypto"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const articlesPath = path.join(root, "data/articles.json")
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://akiba.reload.co.jp").replace(
  /\/$/,
  "",
)
const endpoint = "https://api.x.com/2/tweets"

const args = new Map()
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i]
  if (arg.startsWith("--")) {
    const [key, value] = arg.includes("=") ? arg.split(/=(.*)/s, 2) : [arg, process.argv[i + 1]]
    args.set(key, value && !value.startsWith("--") ? value : true)
    if (value && !value.startsWith("--") && !arg.includes("=")) i += 1
  }
}

const isDryRun = args.has("--dry-run")
const limit = Number(args.get("--limit") || 10)

const loadEnvFile = (file) => {
  if (!fs.existsSync(file)) return

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "")
  }
}

loadEnvFile(path.join(root, ".env"))
loadEnvFile(path.join(root, ".env.local"))

const requiredEnv = [
  "X_API_KEY",
  "X_API_SECRET",
  "X_ACCESS_TOKEN",
  "X_ACCESS_TOKEN_SECRET",
]

const missingEnv = requiredEnv.filter((key) => !process.env[key])
if (missingEnv.length && !isDryRun) {
  throw new Error(`Missing X API credentials: ${missingEnv.join(", ")}`)
}

const articles = JSON.parse(fs.readFileSync(articlesPath, "utf8"))

const getChangedSlugs = () => {
  const explicitSlug = args.get("--slug")
  if (explicitSlug) return [explicitSlug]

  const changedFrom = args.get("--changed-from")
  const diffArgs = changedFrom
    ? ["diff", "--unified=0", `${changedFrom}..HEAD`, "--", "data/articles.json"]
    : ["diff", "--unified=0", "--", "data/articles.json"]

  const diff = execFileSync("git", diffArgs, { encoding: "utf8" })
  return Array.from(
    new Set(
      diff
        .split(/\r?\n/)
        .map((line) => line.match(/^\+\s+"slug":\s+"([^"]+)"/)?.[1])
        .filter(Boolean),
    ),
  )
}

const encode = (value) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )

const buildAuthHeader = (method, url) => {
  const oauth = {
    oauth_consumer_key: process.env.X_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: process.env.X_ACCESS_TOKEN,
    oauth_version: "1.0",
  }

  const params = Object.entries(oauth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encode(key)}=${encode(value)}`)
    .join("&")

  const base = [method.toUpperCase(), encode(url), encode(params)].join("&")
  const signingKey = `${encode(process.env.X_API_SECRET)}&${encode(
    process.env.X_ACCESS_TOKEN_SECRET,
  )}`
  const signature = crypto.createHmac("sha1", signingKey).update(base).digest("base64")

  return `OAuth ${Object.entries({ ...oauth, oauth_signature: signature })
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encode(key)}="${encode(value)}"`)
    .join(", ")}`
}

const truncate = (text, maxLength) =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}…`

const buildTweet = (article) => {
  const url = `${siteUrl}/articles/${article.slug}`
  const title = article.title.replace(/^【秋葉原】/, "")
  const eventDate = article.event?.startDate ? `\n開催: ${article.event.startDate}` : ""
  const base = `新着記事\n${title}${eventDate}\n${url}`
  return truncate(base, 280)
}

const slugs = getChangedSlugs()
const targets = slugs
  .map((slug) => articles.find((article) => article.slug === slug))
  .filter(Boolean)
  .slice(0, limit)

if (!targets.length) {
  console.log("No new article slugs found.")
  process.exit(0)
}

for (const article of targets) {
  const text = buildTweet(article)

  if (isDryRun) {
    console.log(`DRY RUN: ${article.slug}\n${text}\n`)
    continue
  }

  const body = JSON.stringify({ text })
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader("POST", endpoint),
      "Content-Type": "application/json",
    },
    body,
  })

  const payload = await response.text()
  if (!response.ok) {
    throw new Error(`Failed to tweet ${article.slug}: ${response.status} ${payload}`)
  }

  console.log(`Tweeted ${article.slug}: ${payload}`)
}
