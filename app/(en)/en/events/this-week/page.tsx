import Link from "next/link"
import {
  getOngoingEvents,
  getUpcomingThisWeekEvents,
  getArticleImage,
  getEnglishEventVenue,
} from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { EventCard } from "components/event-card"

export const metadata = {
  title: "Akihabara Events This Week | Anime, Games, Collab Cafe",
  description:
    "Events happening in Akihabara this week. Ongoing events and upcoming events starting this week — with venue and dates.",
  alternates: {
    canonical: "/en/events/this-week/",
    languages: {
      "x-default": "/en/events/this-week/",
      ja: "/events/this-week/",
      "ja-JP": "/events/this-week/",
      en: "/en/events/this-week/",
      "en-US": "/en/events/this-week/",
    },
  },
  openGraph: {
    title: "Akihabara Events This Week | Anime, Games, Collab Cafe",
    description:
      "Events happening in Akihabara this week. Ongoing events and upcoming events starting this week.",
    url: "/en/events/this-week/",
    type: "website",
    locale: "en_US",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const ongoingEvents = getOngoingEvents(today).filter((a) => a.en)
  const upcomingEvents = getUpcomingThisWeekEvents(today, 7).filter((a) => a.en)

  const pageUrl = absoluteUrl("/en/events/this-week/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
        { "@type": "ListItem", position: 2, name: "Events", item: absoluteUrl("/en/events/") },
        { "@type": "ListItem", position: 3, name: "This Week", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "Akihabara Events This Week",
      description: "Events happening in Akihabara this week — ongoing and starting soon.",
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
            { label: "This Week" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">This Week in Akihabara</p>
          <h1 className="events-page__title">Akihabara Events This Week</h1>
        </header>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`Ongoing Events (${ongoingEvents.length})`}
        >
          {ongoingEvents.length === 0 ? (
            <p className="events-page__empty">No ongoing events at this time.</p>
          ) : (
            <ul className="events-list events-list--grid">
              {ongoingEvents.map((a) => (
                <EventCard
                  key={a.id}
                  href={`/en/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  title={a.en!.title}
                  venue={getEnglishEventVenue(a) ?? a.event!.venue}
                  dateRange={fmtRange(a.event!.startDate, a.event!.endDate, "–")}
                  layout="grid"
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection
          id="upcoming-heading"
          kicker="Coming This Week"
          title={`Starting This Week (${upcomingEvents.length})`}
        >
          {upcomingEvents.length === 0 ? (
            <p className="events-page__empty">No events starting this week.</p>
          ) : (
            <ul className="events-list events-list--grid">
              {upcomingEvents.map((a) => (
                <EventCard
                  key={a.id}
                  href={`/en/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  title={a.en!.title}
                  venue={getEnglishEventVenue(a) ?? a.event!.venue}
                  dateRange={fmtRange(a.event!.startDate, a.event!.endDate, "–")}
                  layout="grid"
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection id="related-heading" kicker="Related" title="Related Pages">
          <ul className="today-related">
            <li>
              <Link href="/en/events/today/" className="today-related__link">
                Today&apos;s events →
              </Link>
            </li>
            <li>
              <Link href="/en/events/monthly/" className="today-related__link">
                Monthly event calendar →
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
