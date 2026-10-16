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

const LIVE_TAG_IDS = [139, 140]

export const metadata = {
  title: "秋葉原ライブスケジュール【今日・開催予定】",
  description:
    "秋葉原のライブ・ライブハウス公演スケジュールを一覧で紹介。今日のライブから開催予定のアイドル・バンド・アニソン公演まで、会場・日程・料金・公式リンク付きで確認できます。",
  alternates: { canonical: "/events/live/" },
  openGraph: {
    title: "秋葉原ライブスケジュール【今日・開催予定】",
    description:
      "秋葉原のライブ・ライブハウス公演スケジュールを一覧で紹介。今日のライブから開催予定のアイドル・バンド・アニソン公演まで、会場・日程・料金・公式リンク付きで確認できます。",
    url: "/events/live/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  })

  const allLive = getAllArticles().filter(
    (a) => a.event && a.tagIds.some((tid) => LIVE_TAG_IDS.includes(tid))
  )

  const ongoing = allLive.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today
  )
  const upcoming = allLive.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/events/live/")

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
          name: "ライブスケジュール",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原ライブスケジュール【今日・開催予定】",
      description:
        "秋葉原のライブ・ライブハウス公演スケジュールを一覧で紹介。今日のライブから開催予定のアイドル・バンド・アニソン公演まで、会場・日程・料金・公式リンク付きで確認できます。",
      inLanguage: "ja",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "本日のライブ一覧",
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
            { label: "ライブスケジュール" },
          ]}
        />

        <header
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">Live in Akihabara</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            秋葉原ライブスケジュール【今日・開催予定】
          </h1>
        </header>

        <p className="today-lead">
          秋葉原ではCLUB GOODMANをはじめとするライブハウスやイベントスペースで、アイドル・バンド・アニソンのライブが毎日のように開催中。
          今日行けるライブと今後の公演予定を、会場・日程・料金つきでまとめて紹介。
          仕事帰りにふらっと寄れる公演も多いので、気になるライブをチェックしよう。
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`本日のライブ（${ongoing.length}件）`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">
              今日のライブ情報はまだないみたい。
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
          title={`開催予定のライブ（${upcoming.length}件）`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">
              今のところ開催予定のライブはなし。
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
                  layout="grid"
                />
              ))}
            </ul>
          )}
        </EventSection>

        {allLive.length > 0 && (
          <EventSection id="live-map-heading" kicker="Map" title="会場マップ">
            <div className="events-page__bottom-map">
              <EventsMap events={allLive} />
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
