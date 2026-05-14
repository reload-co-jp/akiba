import type { MetadataRoute } from "next"
import { getAllArticles, getArticlePublishedDate } from "lib/articles"
import { absoluteUrl } from "lib/site"

export const dynamic = "force-static"

const sitemap = (): MetadataRoute.Sitemap => {
  const articles = getAllArticles()

  const latestDate = new Date(
    Math.max(...articles.map((article) => getArticlePublishedDate(article).getTime())),
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
    {
      url: absoluteUrl("/about/"),
      lastModified: latestDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}/`),
      lastModified: getArticlePublishedDate(article),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...articles
      .filter((article) => article.en)
      .map((article) => ({
        url: absoluteUrl(`/en/articles/${article.slug}/`),
        lastModified: getArticlePublishedDate(article),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ]
}

export default sitemap
