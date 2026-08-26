import Link from "next/link"
import { getOngoingEvents, getUpcomingThisWeekEvents, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"

export const metadata = {
  title: "秋葉原のイベント情報【今週開催】アニメ・ゲーム・コラボカフェまとめ",
  description:
    "今週開催される秋葉原のイベントを一覧で紹介。開催中のイベントと今週スタート予定のイベントを会場・期間付きで確認できます。",
  alternates: { canonical: "/events/this-week/" },
  openGraph: {
    title: "秋葉原のイベント情報【今週開催】アニメ・ゲーム・コラボカフェまとめ",
    description:
      "今週開催される秋葉原のイベントを一覧で紹介。開催中のイベントと今週スタート予定のイベントを会場・期間付きで確認できます。",
    url: "/events/this-week/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const ongoingEvents = getOngoingEvents(today)
  const upcomingEvents = getUpcomingThisWeekEvents(today, 7)

  const pageUrl = absoluteUrl("/events/this-week/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "今週のイベント", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原のイベント情報【今週開催】",
      description:
        "今週開催される秋葉原のイベントを一覧で紹介。開催中のイベントと今週スタート予定のイベントを会場・期間付きで確認できます。",
      inLanguage: "ja",
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="events-page">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "イベント", href: "/events/" },
            { label: "今週のイベント" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">This Week in Akihabara</p>
          <h1 className="events-page__title">秋葉原のイベント情報【今週開催】</h1>
        </header>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`開催中のイベント（${ongoingEvents.length}件）`}
        >
          {ongoingEvents.length === 0 ? (
            <p className="events-page__empty">現在開催中のイベントはありません。</p>
          ) : (
            <ul className="events-list events-list--grid">
              {ongoingEvents.map((a) => (
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

        <EventSection
          id="upcoming-heading"
          kicker="Coming This Week"
          title={`今週開始予定のイベント（${upcomingEvents.length}件）`}
        >
          {upcomingEvents.length === 0 ? (
            <p className="events-page__empty">今週開始予定のイベントはありません。</p>
          ) : (
            <ul className="events-list events-list--grid">
              {upcomingEvents.map((a) => (
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

        <EventSection id="related-heading" kicker="Related" title="関連リンク">
          <ul className="today-related">
            <li>
              <Link href="/events/today/" className="today-related__link">
                今日のイベント →
              </Link>
            </li>
            <li>
              <Link href="/events/this-weekend/" className="today-related__link">
                今週末のイベント →
              </Link>
            </li>
            <li>
              <Link href="/events/monthly/" className="today-related__link">
                月別イベントカレンダー →
              </Link>
            </li>
            <li>
              <Link href="/events/collab-cafe/" className="today-related__link">
                コラボカフェ特集 →
              </Link>
            </li>
            <li>
              <Link href="/events/popup/" className="today-related__link">
                POPUPストア特集 →
              </Link>
            </li>
            <li>
              <Link href="/events/calendar/" className="today-related__link">
                イベントカレンダー →
              </Link>
            </li>
          </ul>
        </EventSection>
      </div>
    </>
  )
}

export default Page
