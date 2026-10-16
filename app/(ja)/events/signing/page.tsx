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

const SIGNING_TAG_ID = 86
const SIGNING_TITLE = /サイン会|お渡し会|握手会|リリースイベント|リリイベ/

export const metadata = {
  title: "秋葉原のサイン会・お渡し会一覧【開催予定】",
  description:
    "秋葉原で開催予定のサイン会・お渡し会・握手会を一覧で紹介。書泉ブックタワー・ゲーマーズ・アニメイトなどで開催される写真集・書籍・CDのリリースイベントを会場・日程・参加条件・公式リンク付きで確認できます。",
  alternates: { canonical: "/events/signing/" },
  openGraph: {
    title: "秋葉原のサイン会・お渡し会一覧【開催予定】",
    description:
      "秋葉原で開催予定のサイン会・お渡し会・握手会を一覧で紹介。書泉ブックタワー・ゲーマーズ・アニメイトなどで開催される写真集・書籍・CDのリリースイベントを会場・日程・参加条件・公式リンク付きで確認できます。",
    url: "/events/signing/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  })

  const allSigning = getAllArticles().filter(
    (a) => a.event && (a.tagIds.includes(SIGNING_TAG_ID) || SIGNING_TITLE.test(a.title))
  )

  const ongoing = allSigning.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today
  )
  const upcoming = allSigning.filter((a) => a.event!.startDate > today)
  const past = allSigning
    .filter((a) => a.event!.endDate < today)
    .sort((a, b) => b.event!.endDate.localeCompare(a.event!.endDate))
    .slice(0, 12)

  const pageUrl = absoluteUrl("/events/signing/")

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
          name: "サイン会特集",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原のサイン会・お渡し会一覧【開催予定】",
      description:
        "秋葉原で開催予定のサイン会・お渡し会・握手会を一覧で紹介。書泉ブックタワー・ゲーマーズ・アニメイトなどで開催される写真集・書籍・CDのリリースイベントを会場・日程・参加条件・公式リンク付きで確認できます。",
      inLanguage: "ja",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "開催中のサイン会一覧",
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
            { label: "サイン会特集" },
          ]}
        />

        <header
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">Signing Events in Akihabara</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            秋葉原のサイン会・お渡し会一覧【開催予定】
          </h1>
        </header>

        <p className="today-lead">
          秋葉原では書泉ブックタワーやゲーマーズ、アニメイトなどで、写真集・書籍・CDの発売記念サイン会やお渡し会が数多く開催されている。
          参加には対象商品の購入や整理券が必要な場合が多いので、日程と参加条件を早めにチェックしよう。
          過去に開催されたサイン会もあわせて紹介。
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`開催中のサイン会（${ongoing.length}件）`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">
              今開催中のサイン会はないみたい。
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
          title={`開催予定のサイン会（${upcoming.length}件）`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">
              今のところ開催予定のサイン会はなし。
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

        {past.length > 0 && (
          <EventSection
            id="past-heading"
            kicker="Archive"
            title="過去に開催されたサイン会"
          >
            <ul className="events-list events-list--grid">
              {past.map((a) => (
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
          </EventSection>
        )}

        {allSigning.length > 0 && (
          <EventSection id="signing-map-heading" kicker="Map" title="会場マップ">
            <div className="events-page__bottom-map">
              <EventsMap events={allSigning} />
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
