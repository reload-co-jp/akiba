import Link from "next/link"
import {
  getOngoingEvents,
  getArticleImage,
  getTagById,
  getTagEnName,
  getEnglishEventVenue,
  getEnglishEventPrice,
} from "lib/articles"
import { absoluteUrl } from "lib/site"
import { fmtRange } from "lib/format"
import { Breadcrumb } from "components/breadcrumb"
import { EventCard } from "components/event-card"

const EN_LABELS = { venue: "Venue", dates: "Dates", price: "Price" }

export const metadata = {
  title: "Ongoing Events in Akihabara | Anime, Games, Collab Cafe, Popup",
  description:
    "Browse ongoing events in Akihabara. Anime, games, collab cafes, and popup stores — with venue, dates, and prices.",
  alternates: {
    canonical: "/en/events/",
    languages: {
      "x-default": "/en/events/",
      ja: "/events/",
      "ja-JP": "/events/",
      en: "/en/events/",
      "en-US": "/en/events/",
    },
  },
  openGraph: {
    title: "Ongoing Events in Akihabara | Anime, Games, Collab Cafe, Popup",
    description:
      "Browse ongoing events in Akihabara. Anime, games, collab cafes, and popup stores — with venue, dates, and prices.",
    url: "/en/events/",
    type: "website",
    locale: "en_US",
  },
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const events = getOngoingEvents(today).filter((a) => a.en)

  const pageUrl = absoluteUrl("/en/events/")

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
        { "@type": "ListItem", position: 2, name: "Events", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "Ongoing Events in Akihabara",
      description:
        "Browse ongoing events in Akihabara. Anime, games, collab cafes, and popup stores.",
      inLanguage: "en",
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section style={{ margin: "0 auto", maxWidth: "1080px" }}>
        <Breadcrumb
          ariaLabel="Breadcrumb"
          items={[{ label: "Home", href: "/" }, { label: "Events" }]}
        />

        <div
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
            margin: "0 0 1.5rem",
            padding: "2.5rem 0 0.875rem",
          }}
        >
          <p className="events-page__kicker">Ongoing events</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.5rem",
              fontWeight: "700",
              lineHeight: "1.4",
              margin: "0",
            }}
          >
            Ongoing Events in Akihabara
          </h1>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginTop: "0.75rem",
            }}
          >
            <Link href="/en/events/today/" className="cal__today-btn">
              Today&apos;s events →
            </Link>
            <Link
              href="/en/events/this-week/"
              style={{
                color: "#3f5851",
                fontSize: "0.8125rem",
                textDecoration: "underline",
              }}
            >
              This week&apos;s events
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="events-page__empty">No ongoing events at this time.</p>
        ) : (
          <ul className="events-list events-list--grid">
            {events.map((article) => (
              <EventCard
                key={article.id}
                href={`/en/articles/${article.slug}/`}
                image={getArticleImage(article)}
                title={article.en!.title}
                venue={getEnglishEventVenue(article) ?? article.event!.venue}
                dateRange={fmtRange(
                  article.event!.startDate,
                  article.event!.endDate,
                  "–"
                )}
                price={getEnglishEventPrice(article) ?? article.event!.price}
                tags={article.tagIds.flatMap((tid) => {
                  const t = getTagById(tid)
                  return t ? [getTagEnName(t)] : []
                })}
                headingAs="h2"
                labels={EN_LABELS}
                layout="grid"
              />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default Page
