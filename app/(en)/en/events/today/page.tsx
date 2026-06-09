import Link from "next/link"
import {
  getOngoingEvents,
  getEndingSoonEvents,
  getUpcomingThisWeekEvents,
  getTopVenues,
  getArticleImage,
  getEnglishEventVenue,
  getEnglishEventPrice,
  getTagById,
} from "lib/articles"
import { absoluteUrl, siteName } from "lib/site"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"
import { TodayVenueFilter } from "components/today-venue-filter"
import { TodayCategoryFilter } from "components/today-category-filter"

const CATEGORY_GROUPS: Array<{ id: string; name: string; tagIds: number[] }> = [
  { id: "anime", name: "Anime & Manga", tagIds: [47, 49, 78, 79, 203] },
  { id: "game", name: "Games & Cards", tagIds: [74, 75, 100, 104] },
  { id: "collab-cafe", name: "Collab Cafe", tagIds: [81, 57, 131, 82] },
  { id: "popup", name: "Popup & Limited Shops", tagIds: [17, 128, 129, 196, 54] },
  { id: "hobby", name: "Hobby & Figures", tagIds: [126, 113, 119, 127] },
  { id: "voice-idol", name: "Voice Actors & Idols", tagIds: [167, 168, 42, 146] },
  { id: "exhibition", name: "Exhibition & Art", tagIds: [177, 178, 179, 130, 200] },
  { id: "conference", name: "Technology & Conference", tagIds: [60, 109, 122, 201] },
]


export const generateMetadata = () => {
  const today = new Date().toISOString().slice(0, 10)
  const [, month, day] = today.split("-")
  const dateLabel = `${parseInt(month)}/${parseInt(day)}`
  const ongoingCount = getOngoingEvents(today).filter((a) => a.en).length
  const title = `Akihabara Events Today (${dateLabel}) — ${ongoingCount} Events Ongoing`
  const description = `Events happening in Akihabara today, ${dateLabel}. Anime, games, collab cafes, popup stores, voice actors, and hobby events — ${ongoingCount} ongoing. Filter by venue or category.`
  return {
    title,
    description,
    alternates: {
      canonical: "/en/events/today/",
      languages: {
        "x-default": "/en/events/today/",
        ja: "/events/today/",
        "ja-JP": "/events/today/",
        en: "/en/events/today/",
        "en-US": "/en/events/today/",
      },
    },
    openGraph: {
      title,
      description,
      url: "/en/events/today/",
      type: "website",
      locale: "en_US",
    },
  }
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const [year, month, day] = today.split("-")
  const todayLabel = `${year}/${parseInt(month)}/${parseInt(day)}`

  const allOngoing = getOngoingEvents(today)
  const ongoingEvents = allOngoing.filter((a) => a.en)
  const endingSoonEvents = getEndingSoonEvents(today, 3).filter((a) => a.en)
  const upcomingEvents = getUpcomingThisWeekEvents(today, 7).filter((a) => a.en)
  const topVenues = getTopVenues(15)

  const venueFilterEvents = ongoingEvents.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.en!.title,
    image: a.image,
    tags: a.tagIds.flatMap((tid) => {
      const t = getTagById(tid)
      return t ? [t.name] : []
    }),
    event: {
      venue: getEnglishEventVenue(a) ?? a.event!.venue,
      startDate: a.event!.startDate,
      endDate: a.event!.endDate,
      price: getEnglishEventPrice(a) ?? a.event!.price,
    },
    sourceUrl: a.sources?.[0]?.url,
    sourceLabel: a.sources?.[0]?.label,
  }))

  const categorized = CATEGORY_GROUPS.map((group) => ({
    id: group.id,
    name: group.name,
    events: ongoingEvents
      .filter((e) => e.tagIds.some((id) => group.tagIds.includes(id)))
      .map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.en!.title,
        image: a.image,
        event: {
          venue: getEnglishEventVenue(a) ?? a.event!.venue,
          startDate: a.event!.startDate,
          endDate: a.event!.endDate,
        },
      })),
  })).filter((g) => g.events.length > 0)

  const pageUrl = absoluteUrl("/en/events/today/")

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
      { "@type": "ListItem", position: 2, name: "Events", item: absoluteUrl("/en/events/") },
      { "@type": "ListItem", position: 3, name: "Today's Events", item: pageUrl },
    ],
  }

  const firstImage = ongoingEvents[0] ? absoluteUrl(getArticleImage(ongoingEvents[0]).src) : undefined

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    url: pageUrl,
    name: "Akihabara Events Today",
    description:
      "Events happening in Akihabara today. Anime, games, collab cafes, popup stores, and more.",
    dateModified: today,
    inLanguage: "en",
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
    ...(firstImage ? { image: firstImage } : {}),
  }

  const eventJsonLds = ongoingEvents.slice(0, 10).map((a) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: a.en!.title,
    description: a.en!.summary,
    startDate: a.event!.startDate,
    endDate: a.event!.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(`/en/articles/${a.slug}/`),
    image: absoluteUrl(getArticleImage(a).src),
    inLanguage: "en",
    location: {
      "@type": "Place",
      name: getEnglishEventVenue(a),
      address: {
        "@type": "PostalAddress",
        streetAddress: a.event!.venue,
        addressLocality: "Chiyoda-ku",
        addressRegion: "Tokyo",
        addressCountry: "JP",
      },
    },
    organizer: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, collectionPageJsonLd, ...eventJsonLds]),
        }}
      />

      <div className="events-page">
        <Breadcrumb
          ariaLabel="Breadcrumb"
          items={[
            { label: "Home", href: "/" },
            { label: "Events", href: "/en/events/" },
            { label: "Today's Events" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Today&apos;s Events in Akihabara</p>
          <h1 className="events-page__title">Akihabara Events Today</h1>
          <p className="today-updated">
            {todayLabel} · {ongoingEvents.length} events ongoing
          </p>
        </header>

        <p className="today-lead">
          Every day in Akihabara, a wide variety of events are held — anime and manga, games and
          trading cards, collab cafes, popup stores, voice actor and idol events, and hobby and
          figure exhibitions. This page lists all events ongoing on {todayLabel}, organized by venue
          and category.
        </p>

        <EventSection id="today-events-heading" kicker="Ongoing Today" title="Events in Akihabara Today">
          <TodayVenueFilter
            events={venueFilterEvents}
            hrefPrefix="/en/articles/"
            locale="en"
          />
        </EventSection>

        <EventSection id="category-heading" kicker="By Category" title="Events by Category">
          <TodayCategoryFilter
            groups={categorized}
            hrefPrefix="/en/articles/"
            locale="en"
          />
        </EventSection>

        <EventSection id="ending-soon-heading" kicker="Ending Soon" title="Ending Soon">
          {endingSoonEvents.length === 0 ? (
            <p className="events-page__empty">No events ending within 3 days.</p>
          ) : (
            <ul className="cal__list">
              {endingSoonEvents.map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/en/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.endDate}
                  dateLabel={`ends ${a.event!.endDate.slice(5).replace("-", "/")}`}
                  title={a.en!.title}
                  venue={getEnglishEventVenue(a) ?? a.event!.venue}
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection id="upcoming-heading" kicker="Coming This Week" title="Starting This Week">
          {upcomingEvents.length === 0 ? (
            <p className="events-page__empty">No events starting this week.</p>
          ) : (
            <ul className="cal__list">
              {upcomingEvents.map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/en/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.startDate}
                  dateLabel={`from ${a.event!.startDate.slice(5).replace("-", "/")}`}
                  title={a.en!.title}
                  venue={getEnglishEventVenue(a) ?? a.event!.venue}
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection id="venues-heading" kicker="Popular Venues" title="Popular Venues in Akihabara">
          <ul className="today-venues-grid" aria-label="Event venues in Akihabara">
            {topVenues.map(({ venue }) => (
              <li key={venue} className="today-venues-grid__item">
                {venue}
              </li>
            ))}
          </ul>
        </EventSection>

        <EventSection id="related-heading" kicker="Related" title="Related Pages">
          <ul className="today-related">
            <li>
              <Link href="/en/events/this-week/" className="today-related__link">
                This week&apos;s events →
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
