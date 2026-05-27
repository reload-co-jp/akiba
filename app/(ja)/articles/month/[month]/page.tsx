import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getAllMonths, getArticlesByMonth, formatMonth } from "lib/articles"
import { ArticlesViewToggle } from "components/articles-view-toggle"
import { absoluteUrl } from "lib/site"

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
      images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${label}の記事 | アキバLive`,
      description: `アキバLiveの${label}の記事一覧です。`,
      images: ["/images/hero.jpg"],
    },
  }
}

const Page = async ({ params }: Props) => {
  const { month } = await params
  const articles = getArticlesByMonth(month)

  if (articles.length === 0) notFound()

  const label = formatMonth(month)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `秋葉原 ${label}の記事一覧`,
    url: absoluteUrl(`/articles/month/${month}/`),
    numberOfItems: articles.length,
    itemListElement: articles.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: article.title,
      url: absoluteUrl(`/articles/${article.slug}/`),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  )
}

export default Page
