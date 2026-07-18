import Link from "next/link"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"
import { EventCard } from "components/event-card"
import { EventsMap } from "components/events-map"

const POPUP_TAG_IDS = [17, 128, 129, 196, 54, 62]

export const metadata = {
  title: "秋葉原ポップアップストア一覧【開催中・予定】",
  description:
    "秋葉原で開催中・開催予定のポップアップストアを一覧で紹介。アニメ・ゲーム・キャラクターの期間限定ショップやPOPUP情報を会場・期間・公式リンク付きで確認できます。",
  alternates: { canonical: "/events/popup/" },
  openGraph: {
    title: "秋葉原ポップアップストア一覧【開催中・予定】",
    description:
      "秋葉原で開催中・開催予定のポップアップストアを一覧で紹介。アニメ・ゲーム・キャラクターの期間限定ショップやPOPUP情報を会場・期間・公式リンク付きで確認できます。",
    url: "/events/popup/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)

  const allPopup = getAllArticles().filter(
    (a) => a.event && a.tagIds.some((tid) => POPUP_TAG_IDS.includes(tid)),
  )

  const ongoing = allPopup.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today,
  )
  const upcoming = allPopup.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/events/popup/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "POPUPストア特集", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原ポップアップストア一覧【開催中・予定】",
      description:
        "秋葉原で開催中・開催予定のポップアップストアを一覧で紹介。アニメ・ゲーム・キャラクターの期間限定ショップやPOPUP情報を会場・期間・公式リンク付きで確認できます。",
      inLanguage: "ja",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "開催中のポップアップストア一覧",
            url: pageUrl,
            numberOfItems: ongoing.length,
            itemListElement: ongoing.slice(0, 10).map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: a.title,
              url: absoluteUrl(`/articles/${a.slug}/`),
            })),
          },
        ]
      : []),
    ...ongoing.slice(0, 5).map((a) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: a.title,
      startDate: a.event!.startDate,
      endDate: a.event!.endDate,
      url: absoluteUrl(`/articles/${a.slug}/`),
      location: {
        "@type": "Place",
        name: a.event!.venue,
        address: {
          "@type": "PostalAddress",
          addressLocality: "秋葉原",
          addressRegion: "東京都",
          addressCountry: "JP",
        },
      },
      organizer: { "@type": "Organization", name: "アキバLive", url: absoluteUrl("/") },
      performer: a.event!.performer
        ? { "@type": "PerformingGroup", name: a.event!.performer }
        : { "@type": "Organization", name: "アキバLive", url: absoluteUrl("/") },
    })),
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
            { label: "POPUPストア特集" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Popup Store in Akihabara</p>
          <h1 className="events-page__title">秋葉原ポップアップストア一覧【開催中・予定】</h1>
        </header>

        <p className="today-lead">
          秋葉原ではアニメ・ゲーム・アイドルとコラボした期間限定ポップアップストアが続々オープン中。
          限定グッズや描き下ろしビジュアル、サイン入り特典まで、会場でしか手に入らないアイテムを開催期間つきでまとめて紹介。
          気になるPOPUPをチェックして、推しのイベントを見逃さないようにしよう。
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`開催中のポップアップストア（${ongoing.length}件）`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">今開催中のポップアップストアはないみたい。</p>
          ) : (
            <ul className="events-list events-list--grid">
              {ongoing.map((a) => (
                <EventCard
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  title={a.title}
                  venue={a.event!.venue}
                  dateRange={fmtRange(a.event!.startDate, a.event!.endDate)}
                  price={a.event!.price}
                  sourceUrl={a.sources?.[0]?.url}
                  sourceLabel={a.sources?.[0]?.label}
                  layout="grid"
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection
          id="upcoming-heading"
          kicker="Upcoming"
          title={`開催予定のポップアップストア（${upcoming.length}件）`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">今のところ開催予定のポップアップストアはなし。</p>
          ) : (
            <ul className="cal__list cal__list--large">
              {upcoming.map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.startDate}
                  dateLabel={`${a.event!.startDate.slice(5).replace("-", "/")} 〜`}
                  title={a.title}
                  venue={a.event!.venue}
                />
              ))}
            </ul>
          )}
        </EventSection>

        {allPopup.length > 0 && (
          <EventSection id="popup-map-heading" kicker="Map" title="会場マップ">
            <div className="events-page__bottom-map">
              <EventsMap events={allPopup} />
            </div>
          </EventSection>
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
              <Link href="/events/collab-cafe/" className="today-related__link">
                コラボカフェ特集 →
              </Link>
            </li>
            <li>
              <Link href="/events/" className="today-related__link">
                開催中イベント一覧 →
              </Link>
            </li>
          </ul>
        </EventSection>
      </div>
    </>
  )
}

export default Page
