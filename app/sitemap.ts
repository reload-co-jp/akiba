import type { MetadataRoute } from "next"
import { getAllArticles } from "lib/articles"
import { absoluteUrl } from "lib/site"

export const dynamic = "force-static"

const sitemap = (): MetadataRoute.Sitemap => {
  const articles = getAllArticles()

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(
        Math.max(
          ...articles.map((article) =>
            new Date(article.publishedAt).getTime(),
          ),
        ),
      ),
      changeFrequency: "daily",
      priority: 1,
    },
    ...articles.map((article) => ({
      url: absoluteUrl(`/${article.slug}/`),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}

export default sitemap
