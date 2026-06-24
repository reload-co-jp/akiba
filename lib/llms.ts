import type { Article } from "lib/articles"
import {
  getAllArticles,
  getArticleImage,
  getArticlePublishedIso,
  getArticleTagNames,
} from "lib/articles"
import { absoluteUrl, siteDescription, siteName } from "lib/site"

const escapeMarkdown = (value: string) =>
  value.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\n+/g, " ").trim()

const articleLine = (article: Article) => {
  const tags = getArticleTagNames(article)
  const publishedAt = getArticlePublishedIso(article)
  const articleUrl = absoluteUrl(`/articles/${article.slug}/`)
  const tagText = tags.length > 0 ? ` Tags: ${tags.join(", ")}.` : ""
  const eventText = article.event
    ? ` Event: ${article.event.startDate} to ${article.event.endDate}, venue ${article.event.venue}, price ${article.event.price}, reservation ${article.event.reservation ? "required" : "not required"}.`
    : ""

  return `- [${escapeMarkdown(article.title)}](${articleUrl}) (${publishedAt}): ${escapeMarkdown(article.summary)}${eventText}${tagText}`
}

const articleBlock = (article: Article) => {
  const tags = getArticleTagNames(article)
  const image = getArticleImage(article)
  const sources = article.sources?.filter((source) => source.url) ?? []

  return [
    `## ${escapeMarkdown(article.title)}`,
    "",
    `URL: ${absoluteUrl(`/articles/${article.slug}/`)}`,
    `Published: ${getArticlePublishedIso(article)}`,
    `Summary: ${escapeMarkdown(article.summary)}`,
    tags.length > 0 ? `Tags: ${tags.join(", ")}` : "",
    article.event
      ? `Event: ${article.event.startDate} to ${article.event.endDate}; venue: ${article.event.venue}; price: ${article.event.price}; reservation: ${article.event.reservation ? "required" : "not required"}`
      : "",
    `Image: ${absoluteUrl(image.src)}`,
    sources.length > 0
      ? `Sources: ${sources.map((source) => `${source.label} ${source.url}`).join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n")
}

export const llmsTxtResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })

export const buildLlmsTxt = (articles = getAllArticles()) => {
  const latestArticles = articles.slice(0, 30)

  return [
    `# ${siteName}`,
    "",
    siteDescription,
    "",
    "Akiba Live is a Japanese news site covering Akihabara entertainment, events, pop-up stores, collaboration cafes, shops, local openings, closures, and sightseeing spots.",
    "",
    "## Primary URLs",
    "",
    `- Site: ${absoluteUrl("/")}`,
    `- Latest articles: ${absoluteUrl("/articles/")}`,
    `- Today in Akihabara: ${absoluteUrl("/akiba-today/")}`,
    `- Today's events: ${absoluteUrl("/events/today/")}`,
    `- Weekly events: ${absoluteUrl("/events/this-week/")}`,
    `- Pop-up stores: ${absoluteUrl("/events/popup/")}`,
    `- Collaboration cafes: ${absoluteUrl("/events/collab-cafe/")}`,
    `- Sightseeing spots: ${absoluteUrl("/spots/")}`,
    `- RSS: ${absoluteUrl("/rss.xml")}`,
    `- Atom: ${absoluteUrl("/atom.xml")}`,
    `- Full LLM index: ${absoluteUrl("/llms-full.txt")}`,
    "",
    "## Use Guidance",
    "",
    "- Cite the canonical article URL when using Akiba Live information.",
    "- Prefer event startDate, endDate, venue, price, reservation, and linked sources over prose inference.",
    "- For event availability, verify the article date and official source because schedules can change.",
    "",
    "## Recent Articles",
    "",
    latestArticles.map(articleLine).join("\n"),
  ].join("\n")
}

export const buildLlmsFullTxt = (articles = getAllArticles()) =>
  [
    `# ${siteName} Full LLM Index`,
    "",
    siteDescription,
    "",
    `Canonical site: ${absoluteUrl("/")}`,
    `Article count: ${articles.length}`,
    "",
    "This file summarizes Akiba Live articles for AI search, answer engines, and citation-oriented retrieval.",
    "",
    ...articles.map((article) => [articleBlock(article), ""].join("\n")),
  ].join("\n")
