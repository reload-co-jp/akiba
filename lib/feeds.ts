import type { Article } from "lib/articles"
import { getAllArticles, getArticleImage, getArticlePublishedDate } from "lib/articles"
import { absoluteUrl, siteDescription, siteName } from "lib/site"

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const getLatestArticleDate = (articles: Article[]) =>
  new Date(Math.max(...articles.map((article) => getArticlePublishedDate(article).getTime())))

const getArticleUrl = (article: Article) => absoluteUrl(`/articles/${article.slug}/`)

export const buildRssFeedXml = (articles = getAllArticles()) => {
  const latestDate = getLatestArticleDate(articles)
  const items = articles
    .map((article) => {
      const articleUrl = getArticleUrl(article)
      const image = getArticleImage(article)

      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description>${escapeXml(article.summary)}</description>
      <pubDate>${getArticlePublishedDate(article).toUTCString()}</pubDate>
      <media:content url="${absoluteUrl(image.src)}" medium="image" />
      ${article.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ja</language>
    <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />${items}
  </channel>
</rss>`
}

export const buildAtomFeedXml = (articles = getAllArticles()) => {
  const latestDate = getLatestArticleDate(articles)
  const entries = articles
    .map((article) => {
      const articleUrl = getArticleUrl(article)
      const image = getArticleImage(article)
      const publishedAt = getArticlePublishedDate(article).toISOString()

      return `
  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="${articleUrl}" />
    <id>${articleUrl}</id>
    <published>${publishedAt}</published>
    <updated>${publishedAt}</updated>
    <summary>${escapeXml(article.summary)}</summary>
    <link href="${absoluteUrl(image.src)}" rel="enclosure" type="image/${image.src.endsWith(".png") ? "png" : image.src.endsWith(".webp") ? "webp" : "jpeg"}" />
    ${article.tags.map((tag) => `<category term="${escapeXml(tag)}" />`).join("\n    ")}
  </entry>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(siteName)}</title>
  <subtitle>${escapeXml(siteDescription)}</subtitle>
  <link href="${absoluteUrl("/")}" />
  <link href="${absoluteUrl("/atom.xml")}" rel="self" type="application/atom+xml" />
  <id>${absoluteUrl("/")}</id>
  <updated>${latestDate.toISOString()}</updated>
  <author>
    <name>${escapeXml(siteName)}</name>
  </author>${entries}
</feed>`
}

export const feedResponse = (xml: string) =>
  new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
