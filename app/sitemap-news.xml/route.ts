import { getAllArticles } from "lib/articles"
import { absoluteUrl } from "lib/site"

export const dynamic = "force-static"

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const GET = () => {
  const articles = getAllArticles()

  const urls = articles
    .map(
      (article) => `
  <url>
    <loc>${absoluteUrl(`/articles/${article.slug}/`)}</loc>
    <news:news>
      <news:publication>
        <news:name>アキバLive</news:name>
        <news:language>ja</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt}T00:00:00+09:00</news:publication_date>
      <news:title>${escape(article.title)}</news:title>
    </news:news>
  </url>`,
    )
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}
</urlset>`

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
