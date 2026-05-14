import articlesData from "../data/articles.json"

export type Lang = "ja" | "en"

export type LocaleContent = {
  title: string
  summary: string
  content: string
}

export type Article = {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  publishedAt: string
  tags: string[]
  en?: LocaleContent
  image?: {
    src: string
    alt: string
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
  }
}

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

export const getAllTags = (): string[] => {
  const tags = new Set<string>()
  articlesData.forEach((a) => a.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}

export const getArticlesByTag = (tag: string): Article[] => {
  return getAllArticles().filter((a) => a.tags.includes(tag))
}
