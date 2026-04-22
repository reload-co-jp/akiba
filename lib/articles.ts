import articlesData from "../data/articles.json"

export type Article = {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  publishedAt: string
  tags: string[]
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

export const getAllArticles = (): Article[] => {
  return [...articlesData].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export const getArticleBySlug = (slug: string): Article | undefined => {
  return articlesData.find((a) => a.slug === slug)
}

export const getAllSlugs = (): string[] => {
  return articlesData.map((a) => a.slug)
}
