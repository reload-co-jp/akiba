import Link from "next/link"
import { getWeekendEvents, getNextWeekendRange, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"

export const metadata = {
  title: "秋葉原のイベント情報【今週末開催】アニメ・ゲーム・コラボカフェまとめ",
  description:
    "今週末（土日）に秋葉原で開催されるイベントを一覧で紹介。開催中・開催予定のイベントを会場・期間付きで確認できます。",
  alternates: { canonical: "/events/this-weekend/" },
  openGraph: {
    title: "秋葉原のイベント情報【今週末開催】アニメ・ゲーム・コラボカフェまとめ",
    description:
      "今週末（土日）に秋葉原で開催されるイベントを一覧で紹介。開催中・開催予定のイベントを会場・期間付きで確認できます。",
    url: "/events/this-weekend/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const { start, end } = getNextWeekendRange(today)
  const weekendEvents = getWeekendEvents(today)
  const weekendLabel = `${fmtRange(start, end)}（土・日）`

  const pageUrl = absoluteUrl("/events/this-weekend/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "今週末のイベント", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原のイベント情報【今週末開催】",
      description:
        "今週末（土日）に秋葉原で開催されるイベントを一覧で紹介。開催中・開催予定のイベントを会場・期間付きで確認できます。",
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
            { label: "今週末のイベント" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">This Weekend in Akihabara</p>
          <h1 className="events-page__title">秋葉原のイベント情報【今週末開催】</h1>
          <p className="events-page__lead">{weekendLabel}に秋葉原で開催されるイベントまとめ</p>
        </header>

        <EventSection
          id="weekend-heading"
          kicker="This Weekend"
          title={`今週末開催のイベント（${weekendEvents.length}件）`}
        >
          {weekendEvents.length === 0 ? (
            <p className="events-page__empty">今週末開催予定のイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {weekendEvents.map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.startDate}
                  dateLabel={fmtRange(a.event!.startDate, a.event!.endDate)}
                  title={a.title}
                  venue={a.event!.venue}
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
              <Link href="/events/this-week/" className="today-related__link">
                今週のイベント →
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
