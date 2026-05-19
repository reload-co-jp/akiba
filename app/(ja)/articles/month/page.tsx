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
    <section className="home-articles" aria-labelledby="articles-page-title">
      <div className="home-articles__header">
        <p className="home-articles__kicker">News diary</p>
        <h1 id="articles-page-title" className="home-articles__title">
          月別記事一覧
        </h1>
      </div>
      <ul className="article-month-list">
        {months.map(({ month, label, count }) => (
          <li key={month}>
            <Link href={`/articles/month/${month}/`} className="article-month-list__link">
              <span className="article-month-list__label">{label}</span>
              <span className="article-month-list__count">{count}件</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Page
