import Link from "next/link"
import {
  getOngoingEvents,
  getArticleImage,
  getTagById,
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
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
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
      <section className="events-page">
        <Breadcrumb
          ariaLabel="Breadcrumb"
          items={[
            { label: "Home", href: "/" },
            { label: "Events" },
          ]}
        />

        <div className="events-page__header">
          <p className="events-page__kicker">Ongoing events</p>
          <h1 className="events-page__title">Ongoing Events in Akihabara</h1>
          <div className="cal__subtitle-row">
            <Link href="/en/events/today/" className="cal__today-btn">
              Today&apos;s events →
            </Link>
            <Link href="/en/events/this-week/" className="cal__subtitle-link">
              This week&apos;s events
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="events-page__empty">No ongoing events at this time.</p>
        ) : (
          <ul className="events-list">
            {events.map((article) => (
              <EventCard
                key={article.id}
                href={`/en/articles/${article.slug}/`}
                image={getArticleImage(article)}
                title={article.en!.title}
                venue={getEnglishEventVenue(article) ?? article.event!.venue}
                dateRange={fmtRange(article.event!.startDate, article.event!.endDate, "–")}
                price={getEnglishEventPrice(article) ?? article.event!.price}
                tags={article.tagIds.flatMap((tid) => {
                  const t = getTagById(tid)
                  return t ? [t.name] : []
                })}
                headingAs="h2"
                labels={EN_LABELS}
              />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default Page
