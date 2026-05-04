import type { Article } from "lib/articles"
import { getAllArticles, getArticlePublishedIso } from "lib/articles"
import { absoluteUrl, siteName } from "lib/site"

const newsPublicationLanguage = "ja"
const newsWindowMs = 48 * 60 * 60 * 1000

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

export const getArticlePublicationDate = (article: Article) => {
  return getArticlePublishedIso(article)
}

export const getRecentNewsArticles = (now = new Date()) => {
  const lowerBound = now.getTime() - newsWindowMs

  return getAllArticles().filter((article) => {
    const publishedAt = new Date(getArticlePublicationDate(article)).getTime()

    return publishedAt >= lowerBound && publishedAt <= now.getTime()
  })
}

export const buildNewsSitemapXml = (articles = getRecentNewsArticles()) => {
  const urls = articles
    .map((article) => {
      const publicationDate = getArticlePublicationDate(article)

      return `
  <url>
    <loc>${absoluteUrl(`/articles/${article.slug}/`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>${newsPublicationLanguage}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`
}

export const newsSitemapResponse = () =>
  new Response(buildNewsSitemapXml(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
