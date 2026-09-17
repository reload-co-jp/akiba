import Link from "next/link"
import { HomeArticlesFilter } from "components/home-articles-filter"
import { HomeNewsCarousel } from "components/home-news-carousel"
import {
  getAllArticles,
  getArticleImage,
  getOngoingEvents,
  getTagById,
  getUpcomingThisWeekEvents,
} from "lib/articles"
import { fmtRange } from "lib/format"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"
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

const RECENT_KEYWORD_WINDOW = 60

const Page = () => {
  const articles = getAllArticles()
  const today = new Date().toISOString().slice(0, 10)

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

  const thisWeekEvents = getUpcomingThisWeekEvents(today).slice(0, 4)
  const ongoingEventsAll = getOngoingEvents(today)
  const ongoingEvents = ongoingEventsAll.slice(0, 3)
  const carouselArticles = [...ongoingEventsAll, ...getUpcomingThisWeekEvents(today, 7)]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 8)

  const recentArticles = articles.slice(0, RECENT_KEYWORD_WINDOW)
  const keywordCounts = recentArticles.reduce<Record<number, number>>(
    (counts, article) => {
      for (const id of article.tagIds) {
        counts[id] = (counts[id] ?? 0) + 1
      }
      return counts
    },
    {}
  )
  const keywords = Object.keys(keywordCounts)
    .map(Number)
    .sort((a, b) => keywordCounts[b] - keywordCounts[a])
    .map((id) => getTagById(id))
    .filter((t): t is NonNullable<typeof t> => t != null)
    .slice(0, 12)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">アキバLive｜秋葉原の最新イベント・コラボ・ニュース</h1>

      <HomeNewsCarousel articles={carouselArticles} />

      <div className="home-layout">
        <div className="home-layout__main">
          <EventSection
            id="this-week-events"
            kicker="This Week"
            title="今週のイベント"
          >
            {thisWeekEvents.length === 0 ? (
              <p className="events-page__empty">
                今週開催予定のイベントはまだありません。
              </p>
            ) : (
              <ul className="events-list events-list--grid">
                {thisWeekEvents.map((a) => (
                  <EventCard
                    key={a.id}
                    href={`/articles/${a.slug}/`}
                    image={getArticleImage(a)}
                    title={a.title}
                    venue={a.event!.venue}
                    dateRange={fmtRange(a.event!.startDate, a.event!.endDate)}
                    layout="grid"
                  />
                ))}
              </ul>
            )}
          </EventSection>
        </div>

        <aside className="home-sidebar" aria-label="サイドコンテンツ">
          <AdsenseFluidAd />

          <section className="home-widget" aria-labelledby="home-widget-events">
            <div className="home-widget__header">
              <h2 id="home-widget-events" className="home-widget__title">
                本日の注目イベント
              </h2>
              <Link href="/events/today/" className="home-widget__more">
                もっと見る
              </Link>
            </div>
            <ul className="home-widget-events">
              {ongoingEvents.length === 0 ? (
                <li className="home-widget-events__empty">
                  本日開催中のイベントはありません。
                </li>
              ) : (
                ongoingEvents.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/articles/${a.slug}/`}
                      className="home-widget-events__link"
                    >
                      <span className="home-widget-events__range">
                        {fmtRange(a.event!.startDate, a.event!.endDate)}
                      </span>
                      <span className="home-widget-events__title">
                        {a.title}
                      </span>
                      <span className="home-widget-events__venue">
                        {a.event!.venue}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section
            className="home-widget"
            aria-labelledby="home-widget-keywords"
          >
            <h2 id="home-widget-keywords" className="home-widget__title">
              人気のキーワード
            </h2>
            <div className="home-keyword-list">
              {keywords.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.id}/`}
                  className="home-keyword-list__item"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <HomeArticlesFilter articles={articles} />

      <CalendarView
        events={articles.filter((a) => a.event != null)}
        maxEvents={10}
      />
    </>
  )
}

export default Page
