import Link from "next/link"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"

export const metadata = {
  title: "秋葉原イベントカレンダー【月別】アニメ・ゲーム・コラボカフェまとめ",
  description:
    "秋葉原で開催されるイベントを月別に一覧で確認。アニメ・ゲーム・コラボカフェ・POPUPなど多彩なイベントの開催日程をまとめています。",
  alternates: { canonical: "/events/monthly/" },
  openGraph: {
    title: "秋葉原イベントカレンダー【月別】アニメ・ゲーム・コラボカフェまとめ",
    description:
      "秋葉原で開催されるイベントを月別に一覧で確認。アニメ・ゲーム・コラボカフェ・POPUPなど多彩なイベントの開催日程をまとめています。",
    url: "/events/monthly/",
    type: "website",
  },
}

const fmtMonthLabel = (ym: string) => {
  const [y, m] = ym.split("-")
  return `${y}年${parseInt(m)}月`
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const allEvents = getAllArticles().filter((a) => a.event != null)

  const monthMap = new Map<string, typeof allEvents>()
  for (const a of allEvents) {
    const month = a.event!.startDate.slice(0, 7)
    if (month >= currentMonth) {
      if (!monthMap.has(month)) monthMap.set(month, [])
      monthMap.get(month)!.push(a)
    }
  }

  const months = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const pageUrl = absoluteUrl("/events/monthly/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "月別イベント", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原イベントカレンダー【月別】",
      description:
        "秋葉原で開催されるイベントを月別に一覧で確認。アニメ・ゲーム・コラボカフェ・POPUPなど多彩なイベントの開催日程をまとめています。",
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
            { label: "月別イベント" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Monthly Event Calendar</p>
          <h1 className="events-page__title">秋葉原イベントカレンダー【月別】</h1>
          <p className="cal__subtitle">
            <Link href="/events/calendar/">カレンダー形式で見る</Link>
          </p>
        </header>

        {months.length === 0 ? (
          <p className="events-page__empty">今後のイベント情報はありません。</p>
        ) : (
          months.map(([ym, events]) => (
            <EventSection
              key={ym}
              id={`month-${ym}`}
              title={
                <>
                  {fmtMonthLabel(ym)}
                  <span className="today-month-count">（{events.length}件）</span>
                </>
              }
            >
              <ul className="cal__list">
                {events.map((a) => (
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
            </EventSection>
          ))
        )}

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
              <Link href="/events/this-weekend/" className="today-related__link">
                今週末のイベント →
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
