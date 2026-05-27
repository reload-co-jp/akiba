import { Suspense } from "react"
import { getAllArticles } from "lib/articles"
import { ArticlesViewToggle } from "components/articles-view-toggle"
import AdsenseFluidAd from "components/adsense-fluid-ad"
import { absoluteUrl } from "lib/site"

export const metadata = {
  title: "記事一覧",
  description: "アキバLiveの記事一覧です。秋葉原のエンタメ情報をお届けします。",
  alternates: { canonical: "/articles/" },
  openGraph: {
    title: "記事一覧 | アキバLive",
    description:
      "アキバLiveの記事一覧です。秋葉原のエンタメ情報をお届けします。",
    url: "/articles/",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "記事一覧 | アキバLive",
    description: "アキバLiveの記事一覧です。秋葉原のエンタメ情報をお届けします。",
    images: ["/images/hero.jpg"],
  },
}

const Page = () => {
  const articles = getAllArticles()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "秋葉原 エンタメニュース 記事一覧",
    url: absoluteUrl("/articles/"),
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
            記事一覧
          </h1>
        </div>
        <Suspense fallback={null}>
          <ArticlesViewToggle articles={articles} />
        </Suspense>
        <AdsenseFluidAd />
      </section>
    </>
  )
}

export default Page
