import { Suspense } from "react"
import { getAllArticles } from "lib/articles"
import { ArticlesViewToggle } from "components/articles-view-toggle"

export const metadata = {
  title: "記事一覧",
  description: "アキバLiveの記事一覧です。秋葉原のエンタメ情報をお届けします。",
  alternates: { canonical: "/articles/" },
  openGraph: {
    title: "記事一覧 | アキバLive",
    description: "アキバLiveの記事一覧です。秋葉原のエンタメ情報をお届けします。",
    url: "/articles/",
    type: "website",
  },
}

const Page = () => {
  const articles = getAllArticles()

  return (
    <section className="home-articles" aria-labelledby="articles-page-title">
      <div className="home-articles__header">
        <p className="home-articles__kicker">News diary</p>
        <h1 id="articles-page-title" className="home-articles__title">
          記事一覧
        </h1>
      </div>
      <Suspense fallback={null}>
        <ArticlesViewToggle articles={articles} />
      </Suspense>
    </section>
  )
}

export default Page
