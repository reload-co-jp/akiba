import Link from "next/link"
import { getAllMonths } from "lib/articles"

export const metadata = {
  title: "月別記事一覧",
  description: "アキバLiveの記事を月別に閲覧できます。",
  alternates: { canonical: "/articles/month/" },
  openGraph: {
    title: "月別記事一覧 | アキバLive",
    description: "アキバLiveの記事を月別に閲覧できます。",
    url: "/articles/month/",
    type: "website",
  },
}

const Page = () => {
  const months = getAllMonths()

  return (
    <section
      style={{ margin: "0 auto", maxWidth: "1080px" }}
      aria-labelledby="articles-page-title"
    >
      <div className="home-articles__header">
        <p className="home-articles__kicker">News diary</p>
        <h1 id="articles-page-title" className="home-articles__title">
          月別記事一覧
        </h1>
      </div>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          listStyle: "none",
          margin: "0",
          padding: "0",
        }}
      >
        {months.map(({ month, label, count }) => (
          <li key={month}>
            <Link
              href={`/articles/month/${month}/`}
              className="article-month-list__link"
            >
              <span className="article-month-list__label">{label}</span>
              <span
                style={{
                  color: "#6b7f7a",
                  fontSize: "0.875rem",
                  fontWeight: "400",
                }}
              >
                {count}件
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Page
