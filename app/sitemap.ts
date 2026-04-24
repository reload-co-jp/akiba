import type { MetadataRoute } from "next"
import { getAllArticles } from "lib/articles"
import { absoluteUrl } from "lib/site"

export const dynamic = "force-static"

const sitemap = (): MetadataRoute.Sitemap => {
  const articles = getAllArticles()

  const latestDate = new Date(
    Math.max(...articles.map((a) => new Date(a.publishedAt).getTime())),
  )

  return [
    {
      url: absoluteUrl("/"),
      lastModified: latestDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/articles/"),
      lastModified: latestDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/events/"),
      lastModified: latestDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}/`),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}

export default sitemap
