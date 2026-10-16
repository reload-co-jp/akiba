import { jsonLdScript } from "lib/json-ld"
import Link from "next/link"
import AdsenseDisplayAd from "components/adsense-display-ad"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"
import { EventsMap } from "components/events-map"

const FREE_TAG_ID = 198
const FREE_PRICE = /^(入場|参加|来場|入店)?無料/

export const metadata = {
  title: "秋葉原の無料イベント一覧【開催中・予定】",
  description:
    "秋葉原で入場無料・参加無料のイベントを一覧で紹介。ポップアップストア・展示・体験イベント・フェアなど、無料で楽しめる開催中・開催予定のイベントを会場・期間・公式リンク付きで確認できます。",
  alternates: { canonical: "/events/free/" },
  openGraph: {
    title: "秋葉原の無料イベント一覧【開催中・予定】",
    description:
      "秋葉原で入場無料・参加無料のイベントを一覧で紹介。ポップアップストア・展示・体験イベント・フェアなど、無料で楽しめる開催中・開催予定のイベントを会場・期間・公式リンク付きで確認できます。",
    url: "/events/free/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  })

  const allFree = getAllArticles().filter(
    (a) => a.event && (a.tagIds.includes(FREE_TAG_ID) || FREE_PRICE.test(a.event.price ?? ""))
  )

  const ongoing = allFree.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today
  )
  const upcoming = allFree.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/events/free/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "ホーム",
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "イベント",
          item: absoluteUrl("/events/"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "無料イベント特集",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原の無料イベント一覧【開催中・予定】",
      description:
        "秋葉原で入場無料・参加無料のイベントを一覧で紹介。ポップアップストア・展示・体験イベント・フェアなど、無料で楽しめる開催中・開催予定のイベントを会場・期間・公式リンク付きで確認できます。",
      inLanguage: "ja",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "開催中の無料イベント一覧",
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
      organizer: {
        "@type": "Organization",
        name: "アキバLive",
        url: absoluteUrl("/"),
      },
      performer: a.event!.performer
        ? { "@type": "PerformingGroup", name: a.event!.performer }
        : {
            "@type": "Organization",
            name: "アキバLive",
            url: absoluteUrl("/"),
          },
    })),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <div style={{ margin: "0 auto", maxWidth: "1080px" }}>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "イベント", href: "/events/" },
            { label: "無料イベント特集" },
          ]}
        />

        <header
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">Free Events in Akihabara</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            秋葉原の無料イベント一覧【開催中・予定】
          </h1>
        </header>

        <p className="today-lead">
          秋葉原にはポップアップストアや展示、体験イベントなど、入場無料で楽しめるイベントがたくさん。
          チケット不要でふらっと立ち寄れるイベントを、会場・期間・料金条件つきでまとめて紹介。
          グッズ購入や飲食は別料金の場合もあるので、詳細は各記事でチェックしよう。
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`開催中の無料イベント（${ongoing.length}件）`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">
              今開催中の無料イベントはないみたい。
            </p>
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

        <AdsenseDisplayAd />

        <EventSection
          id="upcoming-heading"
          kicker="Upcoming"
          title={`開催予定の無料イベント（${upcoming.length}件）`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">
              今のところ開催予定の無料イベントはなし。
            </p>
          ) : (
            <ul className="events-list events-list--grid">
              {upcoming.map((a) => (
                <EventCard
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  title={a.title}
                  venue={a.event!.venue}
                  dateRange={fmtRange(a.event!.startDate, a.event!.endDate)}
                  price={a.event!.price}
                  layout="grid"
                />
              ))}
            </ul>
          )}
        </EventSection>

        {allFree.length > 0 && (
          <EventSection id="free-map-heading" kicker="Map" title="会場マップ">
            <div className="events-page__bottom-map">
              <EventsMap events={allFree} />
            </div>
          </EventSection>
        )}

        <AdsenseDisplayAd />

        <EventSection id="related-heading" kicker="Related" title="関連リンク">
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              listStyle: "none",
              margin: "0",
              padding: "0",
            }}
          >
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
              <Link href="/events/popup/" className="today-related__link">
                POPUPストア特集 →
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
