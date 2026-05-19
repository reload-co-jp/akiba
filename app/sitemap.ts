import type { MetadataRoute } from "next"
import { getAllArticles, getAllMonths, getAllTags, getArticlePublishedDate } from "lib/articles"
import { getAllSpots } from "lib/spots"
import { absoluteUrl } from "lib/site"

export const dynamic = "force-static"

const sitemap = (): MetadataRoute.Sitemap => {
  const articles = getAllArticles()
  const months = getAllMonths()
  const tags = getAllTags()
  const spots = getAllSpots()

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
      url: absoluteUrl("/spots/"),
      lastModified: latestDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/about/"),
      lastModified: latestDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/terms/"),
      lastModified: latestDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/privacy/"),
      lastModified: latestDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/articles/month/"),
      lastModified: latestDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...months.map(({ month }) => ({
      url: absoluteUrl(`/articles/month/${month}/`),
      lastModified: latestDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
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
    ...spots.map((spot) => ({
      url: absoluteUrl(`/spots/${spot.slug}/`),
      lastModified: latestDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => ({
      url: absoluteUrl(`/tags/${encodeURIComponent(tag)}/`),
      lastModified: latestDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]
}

export default sitemap
