import { HomeArticlesFilter } from "components/home-articles-filter"
import { getAllArticles } from "lib/articles"
import { CalendarView } from "./events/calendar/calendar-view"
import { absoluteUrl } from "lib/site"
import AdsenseFluidAd from "components/adsense-fluid-ad"

export const metadata = {
  title: "アキバLive｜秋葉原の最新イベント・コラボ・ニュース",
  description:
    "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
  alternates: { canonical: "/" },
  openGraph: {
    title: "アキバLive｜秋葉原の最新イベント・コラボ・ニュース",
    description:
      "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
    url: "/",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "アキバLive｜秋葉原の最新イベント・コラボ・ニュース",
    description:
      "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
    images: ["/images/hero.jpg"],
  },
}

const Page = () => {
  const articles = getAllArticles()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "秋葉原 最新エンタメニュース",
    url: absoluteUrl("/"),
    numberOfItems: articles.slice(0, 20).length,
    itemListElement: articles.slice(0, 20).map((article, i) => ({
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

            <button className="home-hero__link">最新記事を読む</button>
          </form>
        </div>
      </section>

      <HomeArticlesFilter articles={articles} />
      <AdsenseFluidAd />

      <CalendarView
        events={articles.filter((a) => a.event != null)}
        maxEvents={10}
      />
    </>
  )
}

export default Page
