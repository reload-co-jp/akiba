import Link from "next/link"
import { HomeArticlesFilter } from "components/home-articles-filter"
import { getAllArticles } from "lib/articles"

export const metadata = {
  title: "アキバLive",
  description:
    "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
  alternates: { canonical: "/" },
  openGraph: {
    title: "アキバLive",
    description:
      "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
    url: "/",
    type: "website",
  },
}

const Page = () => {
  const articles = getAllArticles()

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__kicker">Akihabara journal</p>
          <h1 className="home-hero__title">アキバLive</h1>
          <p className="home-hero__lead">
            懐かしさと熱気が交差する街で、今日出会えるエンタメの気配を集めます。
          </p>
          <form action="/articles" className="home-hero__search">
            <input
              type="search"
              name="q"
              className="home-hero__search-input"
              placeholder="記事を検索..."
              aria-label="記事を検索"
            />
          </form>
          <Link className="home-hero__link" href={`/articles/`}>
            最新記事を読む
          </Link>
        </div>
      </section>

      <HomeArticlesFilter articles={articles} />
    </>
  )
}

export default Page
