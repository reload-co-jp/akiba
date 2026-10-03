import Link from "next/link"
import type { ReactNode } from "react"
import { getArticleImage } from "lib/articles"
import { splitByStatus, type getEventsForWork } from "lib/event-landings"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"
import { EventsMap } from "components/events-map"

type Events = ReturnType<typeof getEventsForWork>

type Props = {
  path: string
  title: string
  kicker: string
  breadcrumbLabel: string
  /** パンくず3階層目（会場別/作品別の一覧）。 */
  section: { label: string; href: string }
  description: string
  /** CollectionPage.about に入れる対象（Place / CreativeWork 等）。 */
  about: Record<string, unknown>
  lead: ReactNode
  events: Events
  related: { href: string; label: string }[]
  showMap?: boolean
  /** 相互リンク等、関連リンクの前に差し込む節。 */
  children?: ReactNode
}

const fullRange = (s: string, e: string) =>
  `${s.replace(/-/g, "/")} 〜 ${e.replace(/-/g, "/")}`

const EventList = ({ events, past }: { events: Events; past?: boolean }) => (
  <ul className="events-list events-list--grid">
    {events.map((a) => (
      <EventCard
        key={a.id}
        href={`/articles/${a.slug}/`}
        image={getArticleImage(a)}
        title={a.title}
        venue={a.event.venue}
        dateRange={
          past
            ? fullRange(a.event.startDate, a.event.endDate)
            : fmtRange(a.event.startDate, a.event.endDate)
        }
        price={past ? undefined : a.event.price}
        layout="grid"
      />
    ))}
  </ul>
)

export const EventLanding = ({
  path,
  title,
  kicker,
  breadcrumbLabel,
  section,
  description,
  about,
  lead,
  events,
  related,
  showMap,
  children,
}: Props) => {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" })
  const { ongoing, upcoming, past } = splitByStatus(events, today)
  const pageUrl = absoluteUrl(path)
  const listed = [...ongoing, ...upcoming, ...past]

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: section.label, item: absoluteUrl(section.href) },
        { "@type": "ListItem", position: 4, name: breadcrumbLabel, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      url: pageUrl,
      description,
      inLanguage: "ja",
      dateModified: today,
      about,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title,
      url: pageUrl,
      numberOfItems: listed.length,
      itemListElement: listed.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: a.title,
        url: absoluteUrl(`/articles/${a.slug}/`),
      })),
    },
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
            section,
            { label: breadcrumbLabel },
          ]}
        />
        <header
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">{kicker}</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            {title}【開催中・開催予定】
          </h1>
        </header>

        <p className="today-lead">
          {lead}
          現在、開催中{ongoing.length}件・開催予定{upcoming.length}件・過去の開催{past.length}件を掲載しています（
          <time dateTime={today}>{today.replace(/-/g, "/")}</time>更新）。
        </p>

        <EventSection id="ongoing-heading" kicker="Ongoing" title={`開催中（${ongoing.length}件）`}>
          {ongoing.length === 0 ? (
            <p className="events-page__empty">現在開催中のイベントはありません。</p>
          ) : (
            <EventList events={ongoing} />
          )}
        </EventSection>

        <EventSection id="upcoming-heading" kicker="Upcoming" title={`開催予定（${upcoming.length}件）`}>
          {upcoming.length === 0 ? (
            <p className="events-page__empty">
              開催予定のイベントは掲載していません。新しい情報が出しだい追加します。
            </p>
          ) : (
            <EventList events={upcoming} />
          )}
        </EventSection>

        {past.length > 0 && (
          <EventSection id="past-heading" kicker="Archive" title={`過去のイベント（${past.length}件）`}>
            <EventList events={past} past />
          </EventSection>
        )}

        {showMap && (
          <EventSection id="map-heading" kicker="Map" title="会場マップ">
            <div className="events-page__bottom-map">
              <EventsMap events={listed} />
            </div>
          </EventSection>
        )}

        {children}

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
            {[...related, { href: "/events/", label: "開催中イベント一覧" }].map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="today-related__link">
                  {r.label} →
                </Link>
              </li>
            ))}
          </ul>
        </EventSection>
      </div>
    </>
  )
}

/** 会場別・作品別ページへのリンク一覧（ハブページ・相互リンク用）。 */
export const LandingLinks = ({ items }: { items: { href: string; label: string; count: number }[] }) => (
  <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", listStyle: "none", margin: 0, padding: 0 }}>
    {items.map((i) => (
      <li key={i.href}>
        <Link href={i.href} className="today-related__link">
          {i.label}（{i.count}）
        </Link>
      </li>
    ))}
  </ul>
)
