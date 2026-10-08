import Link from "next/link"
import AdsenseDisplayAd from "components/adsense-display-ad"
import { addDays, getArticleImage, getOngoingEvents } from "lib/articles"
import type { Article } from "lib/articles"
import { absoluteUrl, siteName } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"

const FAQ_ITEMS = [
  {
    q: "明日秋葉原で開催されるイベントを一覧で確認できますか？",
    a: "このページの「明日開催の秋葉原イベント一覧」で、明日開催中のイベントをすべて確認できます。毎日更新しています。",
  },
  {
    q: "明日から始まるイベントだけを知りたい",
    a: "「明日スタートのイベント」セクションに、明日が初日のイベントをまとめています。初日限定の特典や先着配布がある場合は各詳細ページをご確認ください。",
  },
  {
    q: "明日で終わるイベントはありますか？",
    a: "「明日が最終日のイベント」セクションで確認できます。見逃し防止にご活用ください。",
  },
  {
    q: "今日開催中のイベントも見たい",
    a: "「今日の秋葉原イベント」ページで本日開催中のイベントを一覧で確認できます。",
  },
  {
    q: "イベントの詳細（料金・公式サイト）はどこで確認できますか？",
    a: "各イベントをクリックすると詳細ページに移動します。会場・期間・料金・公式リンクを掲載しています。開催内容は変更になる場合があるため、お出かけ前に公式サイトもご確認ください。",
  },
]

const getTomorrow = () =>
  addDays(
    new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }),
    1
  )

const toLabel = (date: string) => {
  const [, month, day] = date.split("-")
  const weekday = "日月火水木金土"[new Date(date).getUTCDay()]
  return `${parseInt(month)}月${parseInt(day)}日(${weekday})`
}

export const generateMetadata = () => {
  const tomorrow = getTomorrow()
  const dateLabel = toLabel(tomorrow)
  const count = getOngoingEvents(tomorrow).length
  const title = `明日の秋葉原イベント【${dateLabel}開催${count}件】アニメ・コラボカフェ・POPUP一覧`
  const description = `明日${dateLabel}に秋葉原で開催されるイベント${count}件を一覧で紹介。明日から始まるイベント、明日が最終日のイベントもまとめて確認できます。アニメ・漫画、ゲーム、コラボカフェ、ポップアップストアなどを会場・期間・公式リンク付きで掲載。`
  return {
    title,
    description,
    alternates: { canonical: "/events/tomorrow/" },
    openGraph: {
      title,
      description,
      url: "/events/tomorrow/",
      type: "website",
    },
  }
}

const EventGrid = ({ events }: { events: Article[] }) => (
  <ul className="events-list events-list--grid">
    {events.map((a) => (
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
)

const Page = () => {
  const tomorrow = getTomorrow()
  const tomorrowLabel = `${tomorrow.split("-")[0]}年${toLabel(tomorrow)}`

  const ongoingEvents = getOngoingEvents(tomorrow)
  const startingEvents = ongoingEvents.filter(
    (a) => a.event!.startDate === tomorrow
  )
  const endingEvents = ongoingEvents.filter(
    (a) => a.event!.endDate === tomorrow
  )

  const pageUrl = absoluteUrl("/events/tomorrow/")

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
          name: "明日のイベント",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "明日の秋葉原イベント",
      description:
        "明日秋葉原で開催されるイベント、明日から始まるイベント、明日が最終日のイベントをまとめた一覧ページ。",
      dateModified: addDays(tomorrow, -1),
      inLanguage: "ja",
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: absoluteUrl("/"),
      },
      about: { "@type": "Place", name: "秋葉原" },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: ongoingEvents.length,
        itemListElement: ongoingEvents.slice(0, 20).map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(`/articles/${a.slug}/`),
          name: a.title,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
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
            { label: "明日のイベント" },
          ]}
        />

        <header
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">
            Tomorrow&apos;s Events in Akihabara
          </p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            明日の秋葉原イベント情報
          </h1>
          <p
            style={{
              color: "#8a6f63",
              fontSize: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            {tomorrowLabel} · {ongoingEvents.length}件開催予定
          </p>
        </header>

        <p className="today-lead">
          明日秋葉原に行く予定の方へ。{tomorrowLabel}
          に秋葉原で開催されるイベントを、明日から始まるもの・明日が最終日のものも含めてまとめています。
          アニメ・漫画、ゲーム、コラボカフェ、ポップアップストアなど、お出かけ前の予定立てにご活用ください。
        </p>

        <EventSection
          id="tomorrow-starting-heading"
          kicker="Starts Tomorrow"
          title={`明日スタートのイベント（${startingEvents.length}件）`}
        >
          {startingEvents.length === 0 ? (
            <p className="events-page__empty">
              明日から始まるイベントはありません。
            </p>
          ) : (
            <EventGrid events={startingEvents} />
          )}
        </EventSection>

        <EventSection
          id="tomorrow-ending-heading"
          kicker="Last Day Tomorrow"
          title={`明日が最終日のイベント（${endingEvents.length}件）`}
        >
          {endingEvents.length === 0 ? (
            <p className="events-page__empty">
              明日終了するイベントはありません。
            </p>
          ) : (
            <EventGrid events={endingEvents} />
          )}
        </EventSection>

        <AdsenseDisplayAd />

        <EventSection
          id="tomorrow-events-heading"
          kicker="All Tomorrow"
          title={`明日開催の秋葉原イベント一覧（${ongoingEvents.length}件）`}
        >
          {ongoingEvents.length === 0 ? (
            <p className="events-page__empty">
              明日開催予定のイベントはありません。
            </p>
          ) : (
            <EventGrid events={ongoingEvents} />
          )}
        </EventSection>

        <AdsenseDisplayAd />

        <EventSection id="faq-heading" kicker="FAQ" title="よくある質問">
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              listStyle: "none",
              margin: "0",
              padding: "0",
            }}
          >
            {FAQ_ITEMS.map(({ q, a }) => (
              <li
                key={q}
                style={{
                  background: "#fffdf8",
                  border: "1px solid rgba(96, 120, 111, 0.14)",
                  borderRadius: "8px",
                  padding: "1rem 1.25rem",
                }}
              >
                <p
                  style={{
                    color: "#24312f",
                    fontSize: "0.9375rem",
                    fontWeight: "700",
                    margin: "0 0 0.375rem",
                  }}
                >
                  Q. {q}
                </p>
                <p
                  style={{
                    color: "#3f5851",
                    fontSize: "0.875rem",
                    lineHeight: "1.7",
                    margin: "0",
                  }}
                >
                  A. {a}
                </p>
              </li>
            ))}
          </ul>
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
                今日の秋葉原イベント →
              </Link>
            </li>
            <li>
              <Link
                href="/events/this-weekend/"
                className="today-related__link"
              >
                今週末の秋葉原イベント →
              </Link>
            </li>
            <li>
              <Link href="/events/this-week/" className="today-related__link">
                今週の秋葉原イベント →
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
