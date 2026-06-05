import Link from "next/link"
import {
  getOngoingEvents,
  getUpcomingThisWeekEvents,
  getArticleImage,
  getEnglishEventVenue,
} from "lib/articles"
import { absoluteUrl } from "lib/site"

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

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} – ${e.slice(5).replace("-", "/")}`

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
      description:
        "Events happening in Akihabara this week — ongoing and starting soon.",
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
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/en/events/">Events</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current">This Week</li>
          </ol>
        </nav>

        <header className="events-page__header">
          <p className="events-page__kicker">This Week in Akihabara</p>
          <h1 className="events-page__title">Akihabara Events This Week</h1>
        </header>

        <section className="today-section" aria-labelledby="ongoing-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ongoing</p>
            <h2 id="ongoing-heading" className="today-section__title">
              Ongoing Events ({ongoingEvents.length})
            </h2>
          </div>
          {ongoingEvents.length === 0 ? (
            <p className="events-page__empty">No ongoing events at this time.</p>
          ) : (
            <ul className="cal__list">
              {ongoingEvents.map((a) => (
                <li key={a.id}>
                  <Link href={`/en/articles/${a.slug}/`} className="cal__list-item">
                    <img
                      className="cal__list-image"
                      src={getArticleImage(a).src}
                      alt={getArticleImage(a).alt}
                    />
                    <time className="cal__list-date" dateTime={a.event!.startDate}>
                      {fmtRange(a.event!.startDate, a.event!.endDate)}
                    </time>
                    <span className="cal__list-title">{a.en!.title}</span>
                    <span className="cal__list-venue">{getEnglishEventVenue(a)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="today-section" aria-labelledby="upcoming-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Coming This Week</p>
            <h2 id="upcoming-heading" className="today-section__title">
              Starting This Week ({upcomingEvents.length})
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

        <section className="today-section" aria-labelledby="related-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Related</p>
            <h2 id="related-heading" className="today-section__title">
              Related Pages
            </h2>
          </div>
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
        </section>
      </div>
    </>
  )
}

export default Page
