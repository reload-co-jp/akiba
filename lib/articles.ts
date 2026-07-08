import articlesData from "../data/articles.json"
import authorsData from "../data/authors.json"
import tagsData from "../data/tags.json"

export type Lang = "ja" | "en"

export type Author = {
  id: number
  name: string
  description?: string
  schemaType?: "Person" | "Organization"
}

export const getAllAuthors = (): Author[] => authorsData as Author[]

export const getAuthorById = (id: number): Author | undefined =>
  (authorsData as Author[]).find((a) => a.id === id)

export type Tag = {
  id: number
  name: string
  nameEn?: string
}

export const getAllTagsData = (): Tag[] => tagsData as Tag[]

export const getTagById = (id: number): Tag | undefined =>
  (tagsData as Tag[]).find((t) => t.id === id)

export const getTagEnName = (tag: Tag): string => tag.nameEn ?? tag.name

export type LocaleContent = {
  title: string
  summary: string
  content: string
}

export type Article = {
  id: number
  title: string
  seoTitle?: string
  slug: string
  summary: string
  content: string
  publishedAt: string
  tagIds: number[]
  en?: LocaleContent
  image?: {
    src: string
    alt: string
    width?: number
    height?: number
    sourceLabel?: string
    sourceUrl?: string
  }
  sources?: {
    label: string
    url?: string
  }[]
  event?: {
    venue: string
    startDate: string
    endDate: string
    price: string
    reservation: boolean
    performer?: string
  }
  authorId?: number
}

export const getArticleTagNames = (article: Article): string[] =>
  article.tagIds.map((id) => getTagById(id)?.name ?? "").filter(Boolean)

export const addAkihabaraSeoTitle = (title: string) => `【秋葉原】${title}`

const unique = (items: Array<string | undefined>) =>
  Array.from(
    new Set(
      items
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item)),
    ),
  )

export const getJapaneseSeoKeywords = (article: Article): string[] => {
  const tagNames = getArticleTagNames(article)
  const venue = article.event?.venue
  const base = [
    "秋葉原",
    "アキバ",
    "神田",
    "末広町",
    "御茶ノ水",
    "東京都千代田区",
    "秋葉原イベント",
    "秋葉原ニュース",
    "秋葉原観光",
    "秋葉原おでかけ",
    article.event ? "今日行ける秋葉原イベント" : undefined,
    article.event ? "今週の秋葉原イベント" : undefined,
    venue ? `${venue} イベント` : undefined,
    venue ? `秋葉原 ${venue}` : undefined,
  ]

  return unique([
    ...base,
    ...tagNames,
    ...tagNames.flatMap((tag) => [
      `秋葉原 ${tag}`,
      `神田 ${tag}`,
      venue ? `${venue} ${tag}` : undefined,
    ]),
  ]).slice(0, 30)
}

// <title>/OGP/Twitter向け。Google検索結果での切れを防ぐため、タイトルが長い記事だけ
// data/articles.json の seoTitle（短縮版）を使う。h1やJSON-LDのheadlineは article.title を使う。
export const getSeoTitle = (article: Article) =>
  addAkihabaraSeoTitle(article.seoTitle ?? article.title)

export const getLocalizedContent = (article: Article, lang: Lang): LocaleContent => {
  if (lang === "en" && article.en) return article.en
  return { title: article.title, summary: article.summary, content: article.content }
}

const englishStopWords = new Set([
  "about",
  "after",
  "akihabara",
  "akiba",
  "also",
  "and",
  "are",
  "article",
  "for",
  "from",
  "has",
  "into",
  "its",
  "japan",
  "near",
  "news",
  "not",
  "the",
  "this",
  "tokyo",
  "will",
  "with",
  "you",
])

const titleCase = (s: string) =>
  s
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())

const getEnglishContentDetail = (article: Article, label: string) => {
  const match = article.en?.content.match(
    new RegExp(`^- \\*\\*${label}\\*\\*: (.+)$`, "im"),
  )
  return match?.[1]?.trim()
}

export const getEnglishEventVenue = (article: Article) =>
  getEnglishContentDetail(article, "Venue") ?? article.event?.venue

export const getEnglishEventPrice = (article: Article) =>
  getEnglishContentDetail(article, "Admission") ??
  getEnglishContentDetail(article, "Prices") ??
  getEnglishContentDetail(article, "Price") ??
  article.event?.price

export const getEnglishSeoTitle = (article: Article) => {
  const title = article.en?.title ?? article.title
  return /\b(Akihabara|Tokyo)\b/i.test(title) ? title : `${title} in Akihabara, Tokyo`
}

export const getEnglishSeoDescription = (article: Article) => {
  const summary = article.en?.summary ?? article.summary
  if (/\b(Akihabara|Tokyo|Japan)\b/i.test(summary)) return summary
  return `${summary} Location: Akihabara, Tokyo.`
}

export const getEnglishSeoKeywords = (article: Article) => {
  const sourceText = `${article.en?.title ?? ""} ${article.en?.summary ?? ""} ${article.slug}`
  const venue = getEnglishEventVenue(article)
  const extracted = Array.from(
    new Set(
      sourceText
        .replace(/[^a-zA-Z0-9\s-]/g, " ")
        .split(/\s+/)
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 3 && !englishStopWords.has(word))
        .slice(0, 12)
        .map(titleCase),
    ),
  )

  return Array.from(
    new Set([
      "Akihabara",
      "Tokyo",
      "Japan",
      "Akihabara events",
      "Things to do in Akihabara",
      "Tokyo pop culture",
      ...(article.event ? ["Akihabara event guide"] : []),
      ...(venue && /^[\x20-\x7E]+$/.test(venue) ? [venue] : []),
      ...extracted,
    ]),
  )
}

export const placeholderImage = {
  src: "/images/placeholder.jpg",
  alt: "アキバLiveの記事サムネイル",
  width: 1024,
  height: 683,
}

export const getArticleImage = (article: Article) =>
  article.image ?? placeholderImage

export const getAllArticles = (): Article[] => {
  return [...articlesData].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articlesData.find((a) => a.slug === slug)
}

export const formatDate = (date: string): string => date.replace(/-/g, ".")

export const getArticlePublishedDate = (article: Article) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt)) {
    return new Date(`${article.publishedAt}T00:00:00+09:00`)
  }

  return new Date(article.publishedAt)
}

export const getArticlePublishedIso = (article: Article) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt)) {
    return `${article.publishedAt}T00:00:00+09:00`
  }

  return article.publishedAt
}

export const formatDateTime = (article: Article): string => {
  const date = getArticlePublishedDate(article)
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return `${formatter.format(date).replace(/\//g, ".")} JST`
}

export const getAllSlugs = (): string[] => {
  return articlesData.map((a) => a.slug)
}

export const getEnglishSlugs = (): string[] => {
  return articlesData.filter((a) => a.en).map((a) => a.slug)
}

export const getOngoingEvents = (today: string): Article[] => {
  return getAllArticles().filter(
    (a) => a.event && a.event.startDate <= today && today <= a.event.endDate,
  )
}

export const getAllTags = (): Tag[] => {
  const ids = new Set<number>()
  ;(articlesData as Article[]).forEach((a) => a.tagIds.forEach((id) => ids.add(id)))
  return Array.from(ids)
    .map((id) => getTagById(id)!)
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, "ja"))
}

export const getArticlesByTagId = (id: number): Article[] => {
  return getAllArticles().filter((a) => a.tagIds.includes(id))
}

export const getArticlesBySpotName = (spotName: string, aliases: string[] = []): Article[] => {
  const names = [spotName, ...aliases]
  return getAllArticles().filter(
    (a) =>
      a.event &&
      names.some(
        (name) => a.event!.venue.includes(name) || name.includes(a.event!.venue),
      ),
  )
}

export const getArticlesByAuthorId = (id: number): Article[] => {
  return getAllArticles().filter((a) => a.authorId === id)
}

export type ArticleMonth = {
  month: string
  label: string
  count: number
}

export const getAllMonths = (): ArticleMonth[] => {
  const map = new Map<string, number>()
  for (const article of articlesData) {
    const month = article.publishedAt.slice(0, 7)
    map.set(month, (map.get(month) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, count]) => {
      const [year, m] = month.split("-")
      return { month, label: `${year}年${parseInt(m)}月`, count }
    })
}

export const getArticlesByMonth = (month: string): Article[] => {
  return getAllArticles().filter((a) => a.publishedAt.startsWith(month))
}

export const formatMonth = (month: string): string => {
  const [year, m] = month.split("-")
  return `${year}年${parseInt(m)}月`
}

export const getEndingSoonEvents = (today: string, days = 3): Article[] => {
  const limit = new Date(today)
  limit.setDate(limit.getDate() + days)
  const limitStr = limit.toISOString().slice(0, 10)
  return getAllArticles().filter(
    (a) => a.event && a.event.startDate <= today && a.event.endDate >= today && a.event.endDate <= limitStr,
  )
}

export const getUpcomingThisWeekEvents = (today: string, days = 7): Article[] => {
  const limit = new Date(today)
  limit.setDate(limit.getDate() + days)
  const limitStr = limit.toISOString().slice(0, 10)
  return getAllArticles().filter(
    (a) => a.event && a.event.startDate > today && a.event.startDate <= limitStr,
  )
}

export const getTopVenues = (limit = 15): { venue: string; count: number }[] => {
  const map = new Map<string, number>()
  for (const a of getAllArticles()) {
    if (a.event) map.set(a.event.venue, (map.get(a.event.venue) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([venue, count]) => ({ venue, count }))
}
