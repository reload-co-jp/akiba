import Link from "next/link"
import { getAllArticles, getArticleImage, getEnglishEventVenue } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"

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

  const months = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const pageUrl = absoluteUrl("/en/events/monthly/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
        { "@type": "ListItem", position: 2, name: "Events", item: absoluteUrl("/en/events/") },
        { "@type": "ListItem", position: 3, name: "Monthly Calendar", item: pageUrl },
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
      <div className="events-page">
        <Breadcrumb
          ariaLabel="Breadcrumb"
          items={[
            { label: "Home", href: "/" },
            { label: "Events", href: "/en/events/" },
            { label: "Monthly Calendar" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Monthly Event Calendar</p>
          <h1 className="events-page__title">Akihabara Event Calendar by Month</h1>
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
                  <span className="today-month-count"> ({events.length})</span>
                </>
              }
            >
              <ul className="cal__list">
                {events.map((a) => (
                  <CalListItem
                    key={a.id}
                    href={`/en/articles/${a.slug}/`}
                    image={getArticleImage(a)}
                    dateTime={a.event!.startDate}
                    dateLabel={fmtRange(a.event!.startDate, a.event!.endDate, "–")}
                    title={a.en!.title}
                    venue={getEnglishEventVenue(a) ?? a.event!.venue}
                  />
                ))}
              </ul>
            </EventSection>
          ))
        )}

        <EventSection id="related-heading" kicker="Related" title="Related Pages">
          <ul className="today-related">
            <li>
              <Link href="/en/events/today/" className="today-related__link">
                Today&apos;s events →
              </Link>
            </li>
            <li>
              <Link href="/en/events/this-week/" className="today-related__link">
                This week&apos;s events →
              </Link>
            </li>
            <li>
              <Link href="/en/events/collab-cafe/" className="today-related__link">
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
