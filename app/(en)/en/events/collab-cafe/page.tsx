import Link from "next/link"
import { getAllArticles, getArticleImage, getEnglishEventVenue, getEnglishEventPrice } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"
import { EventCard } from "components/event-card"
import { EventsMap } from "components/events-map"

const COLLAB_CAFE_TAG_IDS = [81, 57, 131, 82]

const EN_LABELS = { venue: "Venue", dates: "Dates", price: "Price" }

export const metadata = {
  title: "Akihabara Collab Cafes | Ongoing & Upcoming Anime/Game Cafes",
  description:
    "Collab cafes currently open and upcoming in Akihabara. Anime and game character collaboration cafes with limited menus and exclusive merchandise.",
  alternates: {
    canonical: "/en/events/collab-cafe/",
    languages: {
      "x-default": "/en/events/collab-cafe/",
      ja: "/events/collab-cafe/",
      "ja-JP": "/events/collab-cafe/",
      en: "/en/events/collab-cafe/",
      "en-US": "/en/events/collab-cafe/",
    },
  },
  openGraph: {
    title: "Akihabara Collab Cafes | Ongoing & Upcoming Anime/Game Cafes",
    description:
      "Collab cafes currently open and upcoming in Akihabara. Anime and game character collaboration cafes.",
    url: "/en/events/collab-cafe/",
    type: "website",
    locale: "en_US",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)

  const allCollabCafe = getAllArticles().filter(
    (a) => a.event && a.en && a.tagIds.some((tid) => COLLAB_CAFE_TAG_IDS.includes(tid)),
  )

  const ongoing = allCollabCafe.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today,
  )
  const upcoming = allCollabCafe.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/en/events/collab-cafe/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
        { "@type": "ListItem", position: 2, name: "Events", item: absoluteUrl("/en/events/") },
        { "@type": "ListItem", position: 3, name: "Collab Cafes", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "Akihabara Collab Cafes",
      description:
        "Collab cafes currently open and upcoming in Akihabara. Anime and game character collaboration cafes.",
      inLanguage: "en",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Ongoing Collab Cafes in Akihabara",
            url: pageUrl,
            numberOfItems: ongoing.length,
            itemListElement: ongoing.slice(0, 10).map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: a.en!.title,
              url: absoluteUrl(`/en/articles/${a.slug}/`),
            })),
          },
        ]
      : []),
    ...ongoing.slice(0, 5).map((a) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: a.en!.title,
      startDate: a.event!.startDate,
      endDate: a.event!.endDate,
      inLanguage: "en",
      url: absoluteUrl(`/en/articles/${a.slug}/`),
      location: {
        "@type": "Place",
        name: getEnglishEventVenue(a),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Akihabara",
          addressRegion: "Tokyo",
          addressCountry: "JP",
        },
      },
      organizer: { "@type": "Organization", name: "Akiba Live", url: absoluteUrl("/") },
      performer: a.event!.performer
        ? { "@type": "PerformingGroup", name: a.event!.performer }
        : { "@type": "Organization", name: "Akiba Live", url: absoluteUrl("/") },
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
          ariaLabel="Breadcrumb"
          items={[
            { label: "Home", href: "/" },
            { label: "Events", href: "/en/events/" },
            { label: "Collab Cafes" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Collab Cafe in Akihabara</p>
          <h1 className="events-page__title">Akihabara Collab Cafes</h1>
        </header>

        <p className="today-lead">
          Akihabara is home to multiple collaboration cafes running at any given time, themed around
          anime, games, and idol properties. Exclusive menus, original illustration merchandise, and
          visit bonuses make these limited-time cafes a must for fans. Browse ongoing and upcoming
          collab cafes below.
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`Ongoing Collab Cafes (${ongoing.length})`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">No collab cafes currently open.</p>
          ) : (
            <ul className="events-list events-list--grid">
              {ongoing.map((a) => (
                <EventCard
                  key={a.id}
                  href={`/en/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  title={a.en!.title}
                  venue={getEnglishEventVenue(a) ?? a.event!.venue}
                  dateRange={fmtRange(a.event!.startDate, a.event!.endDate, "–")}
                  price={getEnglishEventPrice(a) ?? a.event!.price}
                  sourceUrl={a.sources?.[0]?.url}
                  sourceLabel={a.sources?.[0]?.label}
                  labels={EN_LABELS}
                  layout="grid"
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection
          id="upcoming-heading"
          kicker="Upcoming"
          title={`Upcoming Collab Cafes (${upcoming.length})`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">No upcoming collab cafes.</p>
          ) : (
            <ul className="cal__list cal__list--large">
              {upcoming.map((a) => (
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

        {allCollabCafe.length > 0 && (
          <EventSection id="collab-cafe-map-heading" kicker="Map" title="Venue Map">
            <div className="events-page__bottom-map">
              <EventsMap events={allCollabCafe} />
            </div>
          </EventSection>
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
