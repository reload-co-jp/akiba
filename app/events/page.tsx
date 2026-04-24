import Link from "next/link"
import { getOngoingEvents } from "lib/articles"

export const metadata = {
  title: "開催中のイベント",
  description: "秋葉原で現在開催中のイベント一覧",
  alternates: { canonical: "/events/" },
  openGraph: {
    title: "開催中のイベント | アキバLive",
    description: "秋葉原で現在開催中のイベント一覧",
    url: "/events/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const events = getOngoingEvents(today)

  return (
    <section style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: ".75rem", color: "#8a6f63", margin: "0 0 .5rem" }}>Ongoing events</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#24312f", margin: 0 }}>
          開催中のイベント
        </h1>
      </div>

      {events.length === 0 ? (
        <p style={{ color: "#8a6f63" }}>現在開催中のイベントはありません。</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {events.map((article) => (
            <li key={article.id}>
              <Link href={`/articles/${article.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                <article
                  style={{
                    backgroundColor: "#fffdf8",
                    border: "1px solid rgba(96, 120, 111, 0.14)",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "grid",
                    gridTemplateColumns: article.image ? "96px 1fr" : "1fr",
                    gap: "1rem",
                    alignItems: "start",
                  }}
                >
                  {article.image && (
                    <img
                      src={article.image.src}
                      alt={article.image.alt}
                      style={{ width: "96px", height: "96px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  )}
                  <div>
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
                    <h2 style={{ fontSize: "1rem", fontWeight: "bold", color: "#24312f", margin: "0 0 .5rem", lineHeight: "1.4" }}>
                      {article.title}
                    </h2>
                    {article.event && (
                      <dl
                        style={{
                          margin: 0,
                          display: "grid",
                          gridTemplateColumns: "auto 1fr",
                          gap: ".125rem .5rem",
                          fontSize: ".75rem",
                        }}
                      >
                        <dt style={{ color: "#8a6f63" }}>会場</dt>
                        <dd style={{ color: "#24312f", margin: 0 }}>{article.event.venue}</dd>
                        <dt style={{ color: "#8a6f63" }}>期間</dt>
                        <dd style={{ color: "#24312f", margin: 0 }}>
                          {article.event.startDate} 〜 {article.event.endDate}
                        </dd>
                        <dt style={{ color: "#8a6f63" }}>料金</dt>
                        <dd style={{ color: "#24312f", margin: 0 }}>{article.event.price}</dd>
                      </dl>
                    )}
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Page
