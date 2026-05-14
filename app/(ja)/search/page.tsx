import { Suspense } from "react"
import { getAllArticles } from "lib/articles"
import { SearchResults } from "./search-results"

export const metadata = {
  title: "記事を検索",
  description: "アキバLiveの記事をキーワードで検索",
  alternates: { canonical: "/search/" },
  robots: { index: false },
}

const Page = () => {
  const articles = getAllArticles()

  return (
    <section className="home-articles">
      <div className="home-articles__header">
        <p className="home-articles__kicker">Search</p>
        <h1 className="home-articles__title">記事を検索</h1>
      </div>
      <Suspense fallback={null}>
        <SearchResults articles={articles} />
      </Suspense>
    </section>
  )
}

export default Page
