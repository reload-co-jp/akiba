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
import { TodayVenueFilter } from "./today-venue-filter"
import { TodayCategoryFilter } from "./today-category-filter"

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

  const categorized = CATEGORY_GROUPS.map((group) => ({
    ...group,
    events: ongoingEvents.filter((e) => e.tagIds.some((id) => group.tagIds.includes(id))),
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
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/en/events/">Events</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current">Today&apos;s Events</li>
          </ol>
        </nav>

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

        {/* Ongoing Today */}
        <section className="today-section" aria-labelledby="today-events-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ongoing Today</p>
            <h2 id="today-events-heading" className="today-section__title">
              Events in Akihabara Today
            </h2>
          </div>
          <TodayVenueFilter
            events={ongoingEvents.map((a) => ({
              id: a.id,
              slug: a.slug,
              title: a.en!.title,
              image: a.image,
              tagNames: a.tagIds
                .map((tid) => getTagById(tid)?.name)
                .filter((n): n is string => !!n),
              event: {
                venue: getEnglishEventVenue(a) ?? a.event!.venue,
                startDate: a.event!.startDate,
                endDate: a.event!.endDate,
                price: getEnglishEventPrice(a) ?? a.event!.price,
              },
              sourceUrl: a.sources?.[0]?.url,
              sourceLabel: a.sources?.[0]?.label,
            }))}
          />
        </section>

        {/* By Category */}
        <section className="today-section" aria-labelledby="category-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">By Category</p>
            <h2 id="category-heading" className="today-section__title">
              Events by Category
            </h2>
          </div>
          <TodayCategoryFilter
            groups={categorized.map((g) => ({
              id: g.id,
              name: g.name,
              events: g.events.map((a) => ({
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
            }))}
          />
        </section>

        {/* Ending Soon */}
        <section className="today-section" aria-labelledby="ending-soon-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ending Soon</p>
            <h2 id="ending-soon-heading" className="today-section__title">
              Ending Soon
            </h2>
          </div>
          {endingSoonEvents.length === 0 ? (
            <p className="events-page__empty">No events ending within 3 days.</p>
          ) : (
            <ul className="cal__list">
              {endingSoonEvents.map((a) => (
                <li key={a.id}>
                  <Link href={`/en/articles/${a.slug}/`} className="cal__list-item">
                    <img
                      className="cal__list-image"
                      src={getArticleImage(a).src}
                      alt={getArticleImage(a).alt}
                    />
                    <time className="cal__list-date" dateTime={a.event!.endDate}>
                      ends {a.event!.endDate.slice(5).replace("-", "/")}
                    </time>
                    <span className="cal__list-title">{a.en!.title}</span>
                    <span className="cal__list-venue">{getEnglishEventVenue(a)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Coming This Week */}
        <section className="today-section" aria-labelledby="upcoming-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Coming This Week</p>
            <h2 id="upcoming-heading" className="today-section__title">
              Starting This Week
            </h2>
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="events-page__empty">No events starting this week.</p>
          ) : (
            <ul className="cal__list">
              {upcomingEvents.map((a) => (
                <li key={a.id}>
                  <Link href={`/en/articles/${a.slug}/`} className="cal__list-item">
                    <img
                      className="cal__list-image"
                      src={getArticleImage(a).src}
                      alt={getArticleImage(a).alt}
                    />
                    <time className="cal__list-date" dateTime={a.event!.startDate}>
                      from {a.event!.startDate.slice(5).replace("-", "/")}
                    </time>
                    <span className="cal__list-title">{a.en!.title}</span>
                    <span className="cal__list-venue">{getEnglishEventVenue(a)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Popular Venues */}
        <section className="today-section" aria-labelledby="venues-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Popular Venues</p>
            <h2 id="venues-heading" className="today-section__title">
              Popular Venues in Akihabara
            </h2>
          </div>
          <ul className="today-venues-grid" aria-label="Event venues in Akihabara">
            {topVenues.map(({ venue }) => (
              <li key={venue} className="today-venues-grid__item">
                {venue}
              </li>
            ))}
          </ul>
        </section>

        {/* Related Links */}
        <section className="today-section" aria-labelledby="related-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Related</p>
            <h2 id="related-heading" className="today-section__title">
              Related Pages
            </h2>
          </div>
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
        </section>
      </div>
    </>
  )
}

export default Page
