import Link from "next/link"
import { EventsMap } from "components/events-map"
import { getArticleImage, getOngoingEvents, getTagById } from "lib/articles"
import { fmtRange } from "lib/format"
import { EventCard } from "components/event-card"
import { absoluteUrl, siteName } from "lib/site"

export const metadata = {
  title: "秋葉原の開催中イベント一覧｜アニメ・ゲーム・コラボカフェ・POPUP",
  description: "秋葉原で現在開催中のイベントを一覧で紹介。アニメ・ゲーム・コラボカフェ・POPUPストアなど、今すぐ行けるイベントを会場・期間付きで掲載。",
  alternates: { canonical: "/events/" },
  openGraph: {
    title: "秋葉原の開催中イベント一覧｜アニメ・ゲーム・コラボカフェ・POPUP",
    description: "秋葉原で現在開催中のイベントを一覧で紹介。アニメ・ゲーム・コラボカフェ・POPUPストアなど、今すぐ行けるイベントを会場・期間付きで掲載。",
    url: "/events/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const events = getOngoingEvents(today)
  const pageUrl = absoluteUrl("/events/")
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": pageUrl,
      url: pageUrl,
      name: "秋葉原の開催中イベント一覧",
      description:
        "秋葉原で現在開催中のイベントを一覧で紹介。アニメ・ゲーム・コラボカフェ・POPUPストアなどを会場・期間付きで確認できます。",
      inLanguage: "ja",
      dateModified: today,
      publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
      about: [
        { "@type": "Place", name: "秋葉原" },
        { "@type": "Place", name: "神田" },
        { "@type": "Thing", name: "秋葉原イベント" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "秋葉原 開催中イベント",
      url: pageUrl,
      numberOfItems: events.length,
      itemListElement: events.slice(0, 30).map((article, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Event",
          name: article.title,
          description: article.summary,
          startDate: article.event!.startDate,
          endDate: article.event!.endDate,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          url: absoluteUrl(`/articles/${article.slug}/`),
          image: absoluteUrl(getArticleImage(article).src),
          location: {
            "@type": "Place",
            name: article.event!.venue,
            address: {
              "@type": "PostalAddress",
              addressLocality: "千代田区",
              addressRegion: "東京都",
              addressCountry: "JP",
            },
          },
          organizer: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
        },
      })),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="events-page">
        <div className="events-page__header">
          <p className="events-page__kicker">Ongoing events</p>
          <h1 className="events-page__title">
            開催中のイベント
          </h1>
          <div className="cal__subtitle-row">
            <Link href="/events/today/" className="cal__today-btn">今日のイベントを見る →</Link>
            <Link href="/events/calendar/" className="cal__subtitle-link">イベントカレンダーで見る</Link>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="events-page__empty">現在開催中のイベントはありません。</p>
        ) : (
          <div className="events-page__grid">
            <EventsMap events={events} />
            <ul className="events-list">
              {events.map((article) => (
                <EventCard
                  key={article.id}
                  href={`/articles/${article.slug}/`}
                  image={getArticleImage(article)}
                  title={article.title}
                  venue={article.event!.venue}
                  dateRange={fmtRange(article.event!.startDate, article.event!.endDate)}
                  price={article.event!.price}
                  tags={article.tagIds.flatMap((tid) => {
                    const t = getTagById(tid)
                    return t ? [t.name] : []
                  })}
                  headingAs="h2"
                />
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  )
}

export default Page
