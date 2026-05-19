import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getAllMonths, getArticlesByMonth, formatMonth } from "lib/articles"
import { ArticlesViewToggle } from "components/articles-view-toggle"

type Props = {
  params: Promise<{ month: string }>
}

export const generateStaticParams = () => {
  return getAllMonths().map(({ month }) => ({ month }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { month } = await params
  const label = formatMonth(month)
  return {
    title: `${label}の記事`,
    description: `アキバLiveの${label}の記事一覧です。`,
    alternates: { canonical: `/articles/month/${month}/` },
    openGraph: {
      title: `${label}の記事 | アキバLive`,
      description: `アキバLiveの${label}の記事一覧です。`,
      url: `/articles/month/${month}/`,
      type: "website",
    },
  }
}

const Page = async ({ params }: Props) => {
  const { month } = await params
  const articles = getArticlesByMonth(month)

  if (articles.length === 0) notFound()

  const label = formatMonth(month)

  return (
    <section className="home-articles" aria-labelledby="articles-page-title">
      <div className="home-articles__header">
        <p className="home-articles__kicker">News diary</p>
        <h1 id="articles-page-title" className="home-articles__title">
          {label}の記事
        </h1>
      </div>
      <div className="article-month-nav">
        <Link href="/articles/" className="article-month-nav__back">
          ← 月別一覧へ
        </Link>
      </div>
      <Suspense fallback={null}>
        <ArticlesViewToggle articles={articles} />
      </Suspense>
    </section>
  )
}

export default Page
