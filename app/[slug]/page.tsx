import { notFound } from "next/navigation"
import { marked } from "marked"
import { getAllSlugs, getArticleBySlug } from "lib/articles"

type Props = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => {
  return getAllSlugs().map((slug) => ({ slug }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.publishedAt,
    },
  }
}

const Page = async ({ params }: Props) => {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const contentHtml = await marked(article.content)

  return (
    <article style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".75rem" }}>
        {article.tags.map((tag) => (
          <span
            key={tag}
            style={{
              backgroundColor: "#e53e3e",
              color: "#fff",
              fontSize: ".6875rem",
              padding: ".125rem .5rem",
              borderRadius: "4px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#24312f", margin: "0 0 .5rem", lineHeight: "1.4" }}>
        {article.title}
      </h1>

      <time
        dateTime={article.publishedAt}
        style={{ fontSize: ".75rem", color: "#8a6f63", display: "block", marginBottom: "1.5rem" }}
      >
        {article.publishedAt}
      </time>

      {article.event && (
        <div
          style={{
            backgroundColor: "#fffdf8",
            border: "1px solid rgba(96, 120, 111, 0.14)",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: ".875rem",
          }}
        >
          <h2 style={{ fontSize: ".875rem", fontWeight: "bold", color: "#b94a3a", margin: "0 0 .75rem" }}>
            イベント情報
          </h2>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: ".25rem .75rem" }}>
            <dt style={{ color: "#8a6f63" }}>会場</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>{article.event.venue}</dd>
            <dt style={{ color: "#8a6f63" }}>期間</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>{article.event.startDate} 〜 {article.event.endDate}</dd>
            <dt style={{ color: "#8a6f63" }}>料金</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>{article.event.price}</dd>
            <dt style={{ color: "#8a6f63" }}>予約</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>{article.event.reservation ? "要予約" : "不要"}</dd>
          </dl>
        </div>
      )}

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {article.sources && article.sources.length > 0 && (
        <section
          aria-labelledby="article-sources-title"
          style={{
            backgroundColor: "#fffdf8",
            border: "1px solid rgba(96, 120, 111, 0.14)",
            borderRadius: "8px",
            marginTop: "2rem",
            padding: "1rem",
          }}
        >
          <h2
            id="article-sources-title"
            style={{ fontSize: ".875rem", fontWeight: "bold", color: "#b94a3a", margin: "0 0 .75rem" }}
          >
            情報ソース
          </h2>
          <ul style={{ color: "#3f5851", fontSize: ".875rem", lineHeight: "1.7", margin: 0, paddingLeft: "1.25rem" }}>
            {article.sources.map((source) => (
              <li key={`${source.label}-${source.url ?? "text"}`}>
                {source.url ? (
                  <a
                    href={source.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    style={{ color: "#b94a3a" }}
                  >
                    {source.label}
                  </a>
                ) : (
                  source.label
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}

export default Page
