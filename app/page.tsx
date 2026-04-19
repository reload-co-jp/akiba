import Link from "next/link"
import { getAllArticles } from "lib/articles"

export const metadata = {
  title: "アキバLive",
  description: "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
}

const Page = () => {
  const articles = getAllArticles()

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
        {articles.map((article) => (
          <li key={article.id}>
            <Link
              href={`/${article.slug}/`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <article
                style={{
                  backgroundColor: "#333",
                  borderRadius: "8px",
                  padding: "1rem",
                  transition: "background-color 0.2s",
                }}
              >
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".5rem" }}>
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
                <h2 style={{ fontSize: "1rem", fontWeight: "bold", color: "#fff", margin: "0 0 .5rem" }}>
                  {article.title}
                </h2>
                <p style={{ fontSize: ".875rem", color: "#aaa", margin: "0 0 .75rem", lineHeight: "1.6" }}>
                  {article.summary}
                </p>
                <time
                  dateTime={article.publishedAt}
                  style={{ fontSize: ".75rem", color: "#888" }}
                >
                  {article.publishedAt}
                </time>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Page
