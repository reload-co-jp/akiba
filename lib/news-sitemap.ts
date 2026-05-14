import type { Article } from "lib/articles"
import { getAllArticles, getArticlePublishedIso } from "lib/articles"
import { absoluteUrl, siteName, siteNameEn } from "lib/site"

const newsWindowMs = 48 * 60 * 60 * 1000
const maxNewsUrls = 1000

type NewsSitemapLanguage = "ja" | "en" | "all"

type BuildNewsSitemapOptions = {
  language?: NewsSitemapLanguage
}

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

  return getAllArticles()
    .filter((article) => {
      const publishedAt = new Date(getArticlePublicationDate(article)).getTime()

      return publishedAt >= lowerBound && publishedAt <= now.getTime()
    })
    .slice(0, maxNewsUrls)
}

const buildJaNewsUrl = (article: Article) => {
  const publicationDate = getArticlePublicationDate(article)

  return `
  <url>
    <loc>${absoluteUrl(`/articles/${article.slug}/`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteName)}</news:name>
        <news:language>ja</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
}

const buildEnNewsUrl = (article: Article) => {
  if (!article.en) return ""

  const publicationDate = getArticlePublicationDate(article)

  return `
  <url>
    <loc>${absoluteUrl(`/en/articles/${article.slug}/`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteNameEn)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(publicationDate)}</news:publication_date>
      <news:title>${escapeXml(article.en!.title)}</news:title>
    </news:news>
  </url>`
}

export const buildNewsSitemapXml = (
  articles = getRecentNewsArticles(),
  { language = "ja" }: BuildNewsSitemapOptions = {},
) => {
  const urls = articles
    .flatMap((article) => {
      if (language === "ja") return [buildJaNewsUrl(article)]
      if (language === "en") return article.en ? [buildEnNewsUrl(article)] : []
      return [buildJaNewsUrl(article), buildEnNewsUrl(article)].filter(Boolean)
    })
    .slice(0, maxNewsUrls)
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`
}

export const newsSitemapResponse = (options?: BuildNewsSitemapOptions) =>
  new Response(buildNewsSitemapXml(getRecentNewsArticles(), options), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
