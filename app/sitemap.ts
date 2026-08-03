import type { MetadataRoute } from "next"
import {
  getAllArticles,
  getAllAuthors,
  getAllMonths,
  getAllTags,
  getArticleImage,
  getArticlePublishedDate,
  getArticlesByAuthorId,
  getArticlesByMonth,
  getArticlesByTagId,
} from "lib/articles"
import { getDetailPageSpots } from "lib/spots"
import { absoluteUrl } from "lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles()
  const latestDate = new Date(
    Math.max(...articles.map((a) => getArticlePublishedDate(a).getTime())),
  )
  const months = getAllMonths()
  const spots = getDetailPageSpots()
  const tags = getAllTags()

  return [
    { url: absoluteUrl("/"), lastModified: latestDate, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/articles/"), lastModified: latestDate, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/akiba-today/"), lastModified: latestDate, changeFrequency: "daily", priority: 0.95 },
    { url: absoluteUrl("/events/"), lastModified: latestDate, changeFrequency: "daily", priority: 0.7 },
    { url: absoluteUrl("/events/today/"), lastModified: latestDate, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/events/this-week/"), lastModified: latestDate, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/events/monthly/"), lastModified: latestDate, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/events/collab-cafe/"), lastModified: latestDate, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/events/popup/"), lastModified: latestDate, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/spots/"), lastModified: latestDate, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/about/"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/terms/"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/privacy/"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/articles/month/"), lastModified: latestDate, changeFrequency: "monthly", priority: 0.6 },
    ...months.map(({ month }) => {
      const monthArticles = getArticlesByMonth(month)
      const monthLatest = new Date(
        Math.max(...monthArticles.map((a) => getArticlePublishedDate(a).getTime())),
      )
      return {
        url: absoluteUrl(`/articles/month/${month}/`),
        lastModified: monthLatest,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }
    }),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}/`),
      lastModified: getArticlePublishedDate(article),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: [absoluteUrl(getArticleImage(article).src)],
      ...(article.en
        ? {
            alternates: {
              languages: {
                ja: absoluteUrl(`/articles/${article.slug}/`),
                en: absoluteUrl(`/en/articles/${article.slug}/`),
                "x-default": absoluteUrl(`/articles/${article.slug}/`),
              },
            },
          }
        : {}),
    })),
    ...articles
      .filter((a) => a.en)
      .map((article) => ({
        url: absoluteUrl(`/en/articles/${article.slug}/`),
        lastModified: getArticlePublishedDate(article),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images: [absoluteUrl(getArticleImage(article).src)],
        alternates: {
          languages: {
            ja: absoluteUrl(`/articles/${article.slug}/`),
            en: absoluteUrl(`/en/articles/${article.slug}/`),
            "x-default": absoluteUrl(`/articles/${article.slug}/`),
          },
        },
      })),
    ...spots.map((spot) => ({
      url: absoluteUrl(`/spots/${spot.slug}/`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...tags.map((tag) => {
      const tagArticles = getArticlesByTagId(tag.id)
      const tagLatest =
        tagArticles.length > 0
          ? new Date(Math.max(...tagArticles.map((a) => getArticlePublishedDate(a).getTime())))
          : undefined
      return {
        url: absoluteUrl(`/tags/${tag.id}/`),
        ...(tagLatest ? { lastModified: tagLatest } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }
    }),
    ...getAllAuthors().map((author) => {
      const authorArticles = getArticlesByAuthorId(author.id)
      const authorLatest =
        authorArticles.length > 0
          ? new Date(Math.max(...authorArticles.map((a) => getArticlePublishedDate(a).getTime())))
          : undefined
      return {
        url: absoluteUrl(`/authors/${author.id}/`),
        ...(authorLatest ? { lastModified: authorLatest } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }
    }),
  ]
}
