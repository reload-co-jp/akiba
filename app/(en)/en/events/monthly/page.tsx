import Link from "next/link"
import {
  getAllArticles,
  getArticleImage,
  getEnglishEventVenue,
} from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"

export const metadata = {
  title: "Akihabara Event Calendar by Month | Anime, Games, Collab Cafe",
  description:
    "Browse Akihabara events by month. Anime, games, collab cafes, and popup stores — monthly schedule with venue and dates.",
  alternates: {
    canonical: "/en/events/monthly/",
    languages: {
      "x-default": "/en/events/monthly/",
      ja: "/events/monthly/",
      "ja-JP": "/events/monthly/",
      en: "/en/events/monthly/",
      "en-US": "/en/events/monthly/",
    },
  },
  openGraph: {
    title: "Akihabara Event Calendar by Month | Anime, Games, Collab Cafe",
    description:
      "Browse Akihabara events by month — monthly schedule with venue and dates.",
    url: "/en/events/monthly/",
    type: "website",
    locale: "en_US",
  },
}

const fmtMonthLabel = (ym: string) => {
  const [y, m] = ym.split("-")
  const date = new Date(Number(y), Number(m) - 1, 1)
  return date.toLocaleString("en-US", { month: "long", year: "numeric" })
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const allEvents = getAllArticles().filter((a) => a.event != null && a.en)

  const monthMap = new Map<string, typeof allEvents>()
  for (const a of allEvents) {
    const month = a.event!.startDate.slice(0, 7)
    if (month >= currentMonth) {
      if (!monthMap.has(month)) monthMap.set(month, [])
      monthMap.get(month)!.push(a)
    }
  }

  const months = Array.from(monthMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )

  const pageUrl = absoluteUrl("/en/events/monthly/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/en/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Events",
          item: absoluteUrl("/en/events/"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Monthly Calendar",
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "Akihabara Event Calendar by Month",
      description:
        "Browse Akihabara events by month. Anime, games, collab cafes, and popup stores.",
      inLanguage: "en",
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
          ariaLabel="Breadcrumb"
          items={[
            { label: "Home", href: "/" },
            { label: "Events", href: "/en/events/" },
            { label: "Monthly Calendar" },
          ]}
        />

        <header
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">Monthly Event Calendar</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            Akihabara Event Calendar by Month
          </h1>
        </header>

        {months.length === 0 ? (
          <p className="events-page__empty">No upcoming events.</p>
        ) : (
          months.map(([ym, events]) => (
            <EventSection
              key={ym}
              id={`month-${ym}`}
              title={
                <>
                  {fmtMonthLabel(ym)}
                  <span
                    style={{
                      color: "#8a6f63",
                      fontSize: "0.875rem",
                      fontWeight: "400",
                      marginLeft: "0.375rem",
                    }}
                  >
                    {" "}
                    ({events.length})
                  </span>
                </>
              }
            >
              <ul className="events-list events-list--grid">
                {events.map((a) => (
                  <EventCard
                    key={a.id}
                    href={`/en/articles/${a.slug}/`}
                    image={getArticleImage(a)}
                    title={a.en!.title}
                    venue={getEnglishEventVenue(a) ?? a.event!.venue}
                    dateRange={fmtRange(
                      a.event!.startDate,
                      a.event!.endDate,
                      "–"
                    )}
                    layout="grid"
                  />
                ))}
              </ul>
            </EventSection>
          ))
        )}

        <EventSection
          id="related-heading"
          kicker="Related"
          title="Related Pages"
        >
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
              <Link href="/en/events/today/" className="today-related__link">
                Today&apos;s events →
              </Link>
            </li>
            <li>
              <Link
                href="/en/events/this-week/"
                className="today-related__link"
              >
                This week&apos;s events →
              </Link>
            </li>
            <li>
              <Link
                href="/en/events/collab-cafe/"
                className="today-related__link"
              >
                Collab cafe guide →
              </Link>
            </li>
            <li>
              <Link href="/en/events/popup/" className="today-related__link">
                Popup store guide →
              </Link>
            </li>
            <li>
              <Link href="/en/events/" className="today-related__link">
                All ongoing events →
              </Link>
            </li>
          </ul>
        </EventSection>
      </div>
    </>
  )
}

export default Page
