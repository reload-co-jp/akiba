import type { Article } from "lib/articles"
import { getAllArticles } from "lib/articles"
import { absoluteUrl } from "lib/site"

const siteName = "アキバLive"
const siteDescription =
  "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア"
const feedAuthor = "アキバLive"

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const getArticleDate = (article: Article) => {
  const publishedAt = article.publishedAt

  if (/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
    return new Date(`${publishedAt}T00:00:00+09:00`)
  }

  return new Date(publishedAt)
}

const getLatestArticleDate = (articles: Article[]) =>
  new Date(Math.max(...articles.map((article) => getArticleDate(article).getTime())))

const getArticleUrl = (article: Article) => absoluteUrl(`/articles/${article.slug}/`)

export const buildRssFeedXml = (articles = getAllArticles()) => {
  const latestDate = getLatestArticleDate(articles)
  const items = articles
    .map((article) => {
      const articleUrl = getArticleUrl(article)

      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description>${escapeXml(article.summary)}</description>
      <pubDate>${getArticleDate(article).toUTCString()}</pubDate>
      ${article.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`
    })
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
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
      const publishedAt = getArticleDate(article).toISOString()

      return `
  <entry>
    <title>${escapeXml(article.title)}</title>
    <link href="${articleUrl}" />
    <id>${articleUrl}</id>
    <published>${publishedAt}</published>
    <updated>${publishedAt}</updated>
    <summary>${escapeXml(article.summary)}</summary>
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
    <name>${escapeXml(feedAuthor)}</name>
  </author>${entries}
</feed>`
}

export const feedResponse = (xml: string) =>
  new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
