import Link from "next/link"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"
import { EventsMap } from "components/events-map"

const COLLAB_CAFE_TAG_IDS = [81, 57, 131, 82]

export const metadata = {
  title: "秋葉原のコラボカフェ情報【開催中・予定】アニメ・ゲームコラボまとめ",
  description:
    "秋葉原で開催中・開催予定のコラボカフェを一覧で紹介。アニメ・ゲームキャラクターとのコラボカフェや期間限定メニューの情報を会場・期間付きで確認できます。",
  alternates: { canonical: "/events/collab-cafe/" },
  openGraph: {
    title: "秋葉原のコラボカフェ情報【開催中・予定】アニメ・ゲームコラボまとめ",
    description:
      "秋葉原で開催中・開催予定のコラボカフェを一覧で紹介。アニメ・ゲームキャラクターとのコラボカフェや期間限定メニューの情報を会場・期間付きで確認できます。",
    url: "/events/collab-cafe/",
    type: "website",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)

  const allCollabCafe = getAllArticles().filter(
    (a) => a.event && a.tagIds.some((tid) => COLLAB_CAFE_TAG_IDS.includes(tid)),
  )

  const ongoing = allCollabCafe.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today,
  )
  const upcoming = allCollabCafe.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/events/collab-cafe/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "コラボカフェ特集", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原のコラボカフェ情報【開催中・予定】",
      description:
        "秋葉原で開催中・開催予定のコラボカフェを一覧で紹介。アニメ・ゲームキャラクターとのコラボカフェや期間限定メニューの情報を会場・期間付きで確認できます。",
      inLanguage: "ja",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "開催中のコラボカフェ一覧",
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
            { label: "コラボカフェ特集" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Collab Cafe in Akihabara</p>
          <h1 className="events-page__title">秋葉原のコラボカフェ情報【開催中・予定】</h1>
        </header>

        <p className="today-lead">
          秋葉原ではアニメ・ゲーム・アイドルとのコラボカフェが常時複数開催されています。
          描き下ろしメニュー・限定グッズ・来店特典など、推しキャラクターと過ごせる期間限定カフェを開催中・開催予定にわけてまとめました。
          気になるコラボカフェを見つけて、秋葉原での特別な体験を楽しんでください。
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`開催中のコラボカフェ（${ongoing.length}件）`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">現在開催中のコラボカフェはありません。</p>
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
          title={`開催予定のコラボカフェ（${upcoming.length}件）`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">開催予定のコラボカフェはありません。</p>
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

        {allCollabCafe.length > 0 && (
          <EventSection id="collab-cafe-map-heading" kicker="Map" title="会場マップ">
            <div className="events-page__bottom-map">
              <EventsMap events={allCollabCafe} />
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
