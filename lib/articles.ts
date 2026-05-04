import articlesData from "../data/articles.json"

export type Article = {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  publishedAt: string
  tags: string[]
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

export const getOngoingEvents = (today: string): Article[] => {
  return getAllArticles().filter(
    (a) => a.event && a.event.startDate <= today && today <= a.event.endDate,
  )
}
