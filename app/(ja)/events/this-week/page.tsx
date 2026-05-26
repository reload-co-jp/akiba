import Link from "next/link"
import { getOngoingEvents, getUpcomingThisWeekEvents, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"

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

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} 〜 ${e.slice(5).replace("-", "/")}`

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
        <nav className="breadcrumb" aria-label="パンくずリスト">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/events/">イベント</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current">今週のイベント</li>
          </ol>
        </nav>

        <header className="events-page__header">
          <p className="events-page__kicker">This Week in Akihabara</p>
          <h1 className="events-page__title">秋葉原のイベント情報【今週開催】</h1>
        </header>

        <section className="today-section" aria-labelledby="ongoing-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ongoing</p>
            <h2 id="ongoing-heading" className="today-section__title">
              開催中のイベント（{ongoingEvents.length}件）
            </h2>
          </div>
          {ongoingEvents.length === 0 ? (
            <p className="events-page__empty">現在開催中のイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {ongoingEvents.map((a) => (
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
          )}
        </section>

        <section className="today-section" aria-labelledby="upcoming-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Coming This Week</p>
            <h2 id="upcoming-heading" className="today-section__title">
              今週開始予定のイベント（{upcomingEvents.length}件）
            </h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="events-page__empty">今週開始予定のイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {upcomingEvents.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}/`} className="cal__list-item">
                    <img
                      className="cal__list-image"
                      src={getArticleImage(a).src}
                      alt={getArticleImage(a).alt}
                    />
                    <time className="cal__list-date" dateTime={a.event!.startDate}>
                      {a.event!.startDate.slice(5).replace("-", "/")} 〜
                    </time>
                    <span className="cal__list-title">{a.title}</span>
                    <span className="cal__list-venue">{a.event!.venue}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

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
        </section>
      </div>
    </>
  )
}

export default Page
