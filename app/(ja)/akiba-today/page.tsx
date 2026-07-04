import Link from "next/link"
import { Breadcrumb } from "components/breadcrumb"
import { CalListItem } from "components/cal-list-item"
import { EventSection } from "components/event-section"
import {
  formatDate,
  getAllArticles,
  getArticleImage,
  getEndingSoonEvents,
  getOngoingEvents,
  getUpcomingThisWeekEvents,
} from "lib/articles"
import { fmtRange } from "lib/format"
import { absoluteUrl } from "lib/site"

export const metadata = {
  title: "今日の秋葉原まとめ｜開催中イベント・新着ニュース",
  description:
    "今日の秋葉原で開催中のイベント、終了間近のイベント、今週始まる予定、新着ニュースをまとめて確認できます。",
  alternates: { canonical: "/akiba-today/" },
  openGraph: {
    title: "今日の秋葉原まとめ｜開催中イベント・新着ニュース",
    description:
      "今日の秋葉原で開催中のイベント、終了間近のイベント、今週始まる予定、新着ニュースをまとめて確認できます。",
    url: "/akiba-today/",
    type: "website",
  },
}

const getJapanDate = () =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

const Page = () => {
  const today = getJapanDate()
  const [year, month, day] = today.split("-")
  const todayLabel = `${year}年${parseInt(month)}月${parseInt(day)}日`
  const articles = getAllArticles()
  const ongoingEvents = getOngoingEvents(today)
  const endingSoonEvents = getEndingSoonEvents(today, 3)
  const upcomingEvents = getUpcomingThisWeekEvents(today, 7)
  const latestArticles = articles.slice(0, 6)
  const pageUrl = absoluteUrl("/akiba-today/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "今日の秋葉原", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "今日の秋葉原まとめ",
      description:
        "今日の秋葉原で開催中のイベント、終了間近のイベント、今週始まる予定、新着ニュースをまとめた再訪向けページ。",
      dateModified: today,
      inLanguage: "ja",
      about: { "@type": "Place", name: "秋葉原" },
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="events-page akiba-today-page">
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "今日の秋葉原" }]} />

        <header className="events-page__header">
          <p className="events-page__kicker">Akiba Today</p>
          <h1 className="events-page__title">今日の秋葉原まとめ</h1>
          <p className="today-lead">
            {todayLabel}時点の開催中イベント、新着ニュース、今週の予定をまとめて確認。
          </p>
        </header>

        <nav className="akiba-today-links" aria-label="今日の秋葉原ショートカット">
          <Link href="/events/today/">今日開催イベント</Link>
          <Link href="/events/this-week/">今週のイベント</Link>
          <Link href="/articles/">新着記事</Link>
          <Link href="/events/calendar/">カレンダー</Link>
        </nav>

        <EventSection
          id="today-ongoing-heading"
          kicker="Ongoing"
          title={`今日開催中のイベント（${ongoingEvents.length}件）`}
        >
          {ongoingEvents.length === 0 ? (
            <p className="events-page__empty">今日開催中のイベントはありません。</p>
          ) : (
            <>
              <ul className="cal__list">
                {ongoingEvents.slice(0, 8).map((a) => (
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
              <Link href="/events/today/" className="akiba-today-more">
                今日開催イベントをすべて見る →
              </Link>
            </>
          )}
        </EventSection>

        <EventSection
          id="ending-soon-heading"
          kicker="Last Chance"
          title={`終了間近のイベント（${endingSoonEvents.length}件）`}
        >
          {endingSoonEvents.length === 0 ? (
            <p className="events-page__empty">3日以内に終了するイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {endingSoonEvents.slice(0, 6).map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.endDate}
                  dateLabel={`${a.event!.endDate.slice(5).replace("-", "/")}まで`}
                  title={a.title}
                  venue={a.event!.venue}
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection
          id="this-week-heading"
          kicker="Coming This Week"
          title={`今週始まるイベント（${upcomingEvents.length}件）`}
        >
          {upcomingEvents.length === 0 ? (
            <p className="events-page__empty">今週開始予定のイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {upcomingEvents.slice(0, 6).map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.startDate}
                  dateLabel={`${a.event!.startDate.slice(5).replace("-", "/")}から`}
                  title={a.title}
                  venue={a.event!.venue}
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection id="latest-news-heading" kicker="Latest" title="秋葉原の新着ニュース">
          <ul className="article-list">
            {latestArticles.map((article) => (
              <li key={article.id}>
                <Link href={`/articles/${article.slug}/`} className="article-card-link">
                  <article className="article-card">
                    <img
                      src={getArticleImage(article).src}
                      alt={getArticleImage(article).alt}
                      width={getArticleImage(article).width}
                      height={getArticleImage(article).height}
                      className="article-card__image"
                      loading="lazy"
                      decoding="async"
                    />
                    <h3 className="article-card__title">{article.title}</h3>
                    <time className="article-card__date" dateTime={article.publishedAt}>
                      {formatDate(article.publishedAt)}
                    </time>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/articles/" className="akiba-today-more">
            新着記事をもっと見る →
          </Link>
        </EventSection>
      </div>
    </>
  )
}

export default Page
