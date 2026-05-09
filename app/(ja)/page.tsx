import Link from "next/link"
import { HomeArticlesFilter } from "components/home-articles-filter"
import { getAllArticles } from "lib/articles"

export const metadata = {
  title: "アキバLive",
  description: "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
  alternates: { canonical: "/" },
  openGraph: {
    title: "アキバLive",
    description: "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
    url: "/",
    type: "website",
  },
}

const Page = () => {
  const articles = getAllArticles()
  const latestArticle = articles[0]

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__kicker">Akihabara journal</p>
          <h1 className="home-hero__title">アキバLive</h1>
          <p className="home-hero__lead">
            懐かしさと熱気が交差する街で、今日出会えるエンタメの気配を集めます。
          </p>
          {latestArticle && (
            <Link className="home-hero__link" href={`/articles/${latestArticle.slug}/`}>
              最新記事を読む
            </Link>
          )}
        </div>
      </section>

      <HomeArticlesFilter articles={articles} />
    </>
  )
}

export default Page
