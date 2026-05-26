import Link from "next/link"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"

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

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} 〜 ${e.slice(5).replace("-", "/")}`

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
        <nav className="breadcrumb" aria-label="パンくずリスト">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/events/">イベント</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current">月別イベント</li>
          </ol>
        </nav>

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
            <section key={ym} className="today-section" aria-labelledby={`month-${ym}`}>
              <div className="today-section__header">
                <h2 id={`month-${ym}`} className="today-section__title">
                  {fmtMonthLabel(ym)}
                  <span className="today-month-count">（{events.length}件）</span>
                </h2>
              </div>
              <ul className="cal__list">
                {events.map((a) => (
                  <li key={a.id}>
                    <Link href={`/articles/${a.slug}/`} className="cal__list-item">
                      <img
                        className="cal__list-image"
                        src={getArticleImage(a).src}
                        alt={getArticleImage(a).alt}
                      />
                      <time className="cal__list-date" dateTime={a.event!.startDate}>
                        {fmtRange(a.event!.startDate, a.event!.endDate)}
                      </time>
                      <span className="cal__list-title">{a.title}</span>
                      <span className="cal__list-venue">{a.event!.venue}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <section className="today-section" aria-labelledby="related-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Related</p>
            <h2 id="related-heading" className="today-section__title">
              関連リンク
            </h2>
          </div>
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
        </section>
      </div>
    </>
  )
}

export default Page
