import Link from "next/link"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"
import { EventsMap } from "components/events-map"

const COLLAB_CAFE_TAG_IDS = [81, 57, 131, 82]

const COLLAB_TAG_ID = 80

const DESCRIPTION =
  "秋葉原で開催中・開催予定のコラボカフェとアニメ・ゲームのコラボイベントを一覧で紹介。描き下ろしメニューや来店特典、会場・期間・終了したコラボカフェまで毎日更新でまとめています。"

const todayJst = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" })

const monthLabel = (date: string) => {
  const [y, m] = date.split("-")
  return `${y}年${Number(m)}月`
}

export const generateMetadata = () => {
  const title = `秋葉原のコラボカフェ・コラボイベント情報【${monthLabel(todayJst())}】開催中・予定まとめ`
  return {
    title,
    description: DESCRIPTION,
    alternates: { canonical: "/events/collab-cafe/" },
    openGraph: {
      title,
      description: DESCRIPTION,
      url: "/events/collab-cafe/",
      type: "website",
    },
  }
}

const FAQ = [
  {
    q: "秋葉原でコラボカフェが多い場所はどこですか？",
    a: "アニメイト秋葉原ANNEXのコラボカフェスペースや、GiGOコラボカフェ秋葉原3号館、コラボカフェ本舗 秋葉原店などで定期的にアニメ・ゲームのコラボカフェが開催されています。キュアメイドカフェやめいどりーみん、あっとほぉーむカフェなどメイドカフェとのコラボも多いのが秋葉原の特徴です。",
  },
  {
    q: "秋葉原のコラボカフェは予約が必要ですか？",
    a: "人気作品のコラボカフェは事前予約制（抽選・先着）が多く、空きがあれば当日の自由入店に対応する場合もあります。予約方法や入店ルールはコラボごとに異なるため、各記事に掲載している公式サイトで最新情報を確認してください。",
  },
  {
    q: "コラボカフェ以外の秋葉原のコラボイベントも載っていますか？",
    a: "はい。POP UPストアや飲食店・カラオケ・商業施設とのコラボなど、秋葉原で開催中・開催予定のコラボイベントも「その他のコラボイベント」としてまとめています。",
  },
]

const Page = () => {
  const today = todayJst()

  const allCollabCafe = getAllArticles().filter(
    (a) => a.event && a.tagIds.some((tid) => COLLAB_CAFE_TAG_IDS.includes(tid))
  )

  const ongoing = allCollabCafe
    .filter((a) => a.event!.startDate <= today && a.event!.endDate >= today)
    .sort((a, b) => a.event!.endDate.localeCompare(b.event!.endDate))
  const upcoming = allCollabCafe
    .filter((a) => a.event!.startDate > today)
    .sort((a, b) => a.event!.startDate.localeCompare(b.event!.startDate))
  const ended = allCollabCafe
    .filter((a) => a.event!.endDate < today)
    .sort((a, b) => b.event!.endDate.localeCompare(a.event!.endDate))
    .slice(0, 12)

  const otherCollab = getAllArticles()
    .filter(
      (a) =>
        a.event &&
        a.event.endDate >= today &&
        a.tagIds.includes(COLLAB_TAG_ID) &&
        !allCollabCafe.includes(a)
    )
    .sort((a, b) => a.event!.startDate.localeCompare(b.event!.startDate))

  const venueCounts = new Map<string, number>()
  allCollabCafe.forEach((a) =>
    venueCounts.set(a.event!.venue, (venueCounts.get(a.event!.venue) ?? 0) + 1)
  )
  const topVenues = [...venueCounts]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const pageUrl = absoluteUrl("/events/collab-cafe/")

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
          name: "コラボカフェ特集",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原のコラボカフェ・コラボイベント情報",
      description: DESCRIPTION,
      inLanguage: "ja",
      dateModified: today,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ margin: "0 auto", maxWidth: "1080px" }}>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "イベント", href: "/events/" },
            { label: "コラボカフェ特集" },
          ]}
        />

        <header
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">Collab Cafe in Akihabara</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            秋葉原のコラボカフェ・コラボイベント情報【開催中・予定】
          </h1>
        </header>

        <p className="today-lead">
          秋葉原ではアニメ・ゲーム・アイドルとのコラボカフェが常時複数開催されています。
          描き下ろしメニュー・限定グッズ・来店特典など、推しキャラクターと過ごせる期間限定カフェを開催中・開催予定にわけてまとめました。
          あわせてPOP UPストアや飲食店とのコラボなど、秋葉原のコラボイベントも掲載。{monthLabel(today)}の最新情報を毎日更新しています。
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`開催中のコラボカフェ（${ongoing.length}件）`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">
              現在開催中のコラボカフェはありません。
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

        <EventSection
          id="upcoming-heading"
          kicker="Upcoming"
          title={`開催予定のコラボカフェ（${upcoming.length}件）`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">
              開催予定のコラボカフェはありません。
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

        {otherCollab.length > 0 && (
          <EventSection
            id="other-collab-heading"
            kicker="Collab Events"
            title={`秋葉原のその他のコラボイベント（${otherCollab.length}件）`}
          >
            <ul className="events-list events-list--grid">
              {otherCollab.map((a) => (
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

        {topVenues.length > 0 && (
          <EventSection
            id="venues-heading"
            kicker="Venues"
            title="秋葉原の主なコラボカフェ会場"
          >
            <ul>
              {topVenues.map(([venue, n]) => (
                <li key={venue}>
                  {venue}（掲載{n}件）
                </li>
              ))}
            </ul>
          </EventSection>
        )}

        {ended.length > 0 && (
          <EventSection
            id="ended-heading"
            kicker="Archive"
            title="最近終了した秋葉原のコラボカフェ"
          >
            <ul className="events-list events-list--grid">
              {ended.map((a) => (
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

        {allCollabCafe.length > 0 && (
          <EventSection
            id="collab-cafe-map-heading"
            kicker="Map"
            title="会場マップ"
          >
            <div className="events-page__bottom-map">
              <EventsMap events={allCollabCafe} />
            </div>
          </EventSection>
        )}

        <EventSection
          id="faq-heading"
          kicker="FAQ"
          title="秋葉原のコラボカフェに関するよくある質問"
        >
          <dl>
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <dt style={{ fontWeight: "700", marginTop: "1rem" }}>Q. {q}</dt>
                <dd style={{ margin: "0.25rem 0 0" }}>A. {a}</dd>
              </div>
            ))}
          </dl>
        </EventSection>

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
