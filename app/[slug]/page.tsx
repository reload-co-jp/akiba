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

      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff", margin: "0 0 .5rem", lineHeight: "1.4" }}>
        {article.title}
      </h1>

      <time
        dateTime={article.publishedAt}
        style={{ fontSize: ".75rem", color: "#888", display: "block", marginBottom: "1.5rem" }}
      >
        {article.publishedAt}
      </time>

      {article.event && (
        <div
          style={{
            backgroundColor: "#333",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: ".875rem",
          }}
        >
          <h2 style={{ fontSize: ".875rem", fontWeight: "bold", color: "#e53e3e", margin: "0 0 .75rem" }}>
            イベント情報
          </h2>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: ".25rem .75rem" }}>
            <dt style={{ color: "#888" }}>会場</dt>
            <dd style={{ color: "#fff", margin: 0 }}>{article.event.venue}</dd>
            <dt style={{ color: "#888" }}>期間</dt>
            <dd style={{ color: "#fff", margin: 0 }}>{article.event.startDate} 〜 {article.event.endDate}</dd>
            <dt style={{ color: "#888" }}>料金</dt>
            <dd style={{ color: "#fff", margin: 0 }}>{article.event.price}</dd>
            <dt style={{ color: "#888" }}>予約</dt>
            <dd style={{ color: "#fff", margin: 0 }}>{article.event.reservation ? "要予約" : "不要"}</dd>
          </dl>
        </div>
      )}

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  )
}

export default Page
