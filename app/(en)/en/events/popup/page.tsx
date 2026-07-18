import Link from "next/link"
import { getAllArticles, getArticleImage, getEnglishEventVenue, getEnglishEventPrice } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"
import { EventCard } from "components/event-card"
import { EventsMap } from "components/events-map"

const POPUP_TAG_IDS = [17, 128, 129, 196, 54, 62]

const EN_LABELS = { venue: "Venue", dates: "Dates", price: "Price" }

export const metadata = {
  title: "Akihabara Popup Stores | Ongoing & Upcoming Limited Shops",
  description:
    "Popup stores and limited shops currently open and upcoming in Akihabara. Anime, games, and character-themed pop-up shops with exclusive merchandise.",
  alternates: {
    canonical: "/en/events/popup/",
    languages: {
      "x-default": "/en/events/popup/",
      ja: "/events/popup/",
      "ja-JP": "/events/popup/",
      en: "/en/events/popup/",
      "en-US": "/en/events/popup/",
    },
  },
  openGraph: {
    title: "Akihabara Popup Stores | Ongoing & Upcoming Limited Shops",
    description:
      "Popup stores and limited shops currently open and upcoming in Akihabara.",
    url: "/en/events/popup/",
    type: "website",
    locale: "en_US",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)

  const allPopup = getAllArticles().filter(
    (a) => a.event && a.en && a.tagIds.some((tid) => POPUP_TAG_IDS.includes(tid)),
  )

  const ongoing = allPopup.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today,
  )
  const upcoming = allPopup.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/en/events/popup/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
        { "@type": "ListItem", position: 2, name: "Events", item: absoluteUrl("/en/events/") },
        { "@type": "ListItem", position: 3, name: "Popup Stores", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "Akihabara Popup Stores",
      description: "Popup stores and limited shops currently open and upcoming in Akihabara.",
      inLanguage: "en",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Ongoing Popup Stores in Akihabara",
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
            { label: "Popup Stores" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Popup Store in Akihabara</p>
          <h1 className="events-page__title">Akihabara Popup Stores</h1>
        </header>

        <p className="today-lead">
          Akihabara hosts a constant stream of limited-run popup stores themed around anime, games,
          and idol properties. Exclusive merchandise, original illustrations, and venue-only items
          make these time-limited shops essential for collectors. Browse ongoing and upcoming popup
          stores below.
        </p>

        <EventSection
          id="ongoing-heading"
          kicker="Ongoing"
          title={`Ongoing Popup Stores (${ongoing.length})`}
        >
          {ongoing.length === 0 ? (
            <p className="events-page__empty">No popup stores currently open.</p>
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
          title={`Upcoming Popup Stores (${upcoming.length})`}
        >
          {upcoming.length === 0 ? (
            <p className="events-page__empty">No upcoming popup stores.</p>
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

        {allPopup.length > 0 && (
          <EventSection id="popup-map-heading" kicker="Map" title="Venue Map">
            <div className="events-page__bottom-map">
              <EventsMap events={allPopup} />
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
              <Link href="/en/events/collab-cafe/" className="today-related__link">
                Collab cafe guide →
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
