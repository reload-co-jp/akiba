import Link from "next/link"
import {
  getOngoingEvents,
  getArticleImage,
  getTagById,
  getEnglishEventVenue,
  getEnglishEventPrice,
} from "lib/articles"
import { absoluteUrl } from "lib/site"

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
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current">Events</li>
          </ol>
        </nav>

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
              <li key={article.id}>
                <Link href={`/en/articles/${article.slug}/`} className="events-card-link">
                  <article className="events-card events-card--with-image">
                    <img
                      className="events-card__image"
                      src={getArticleImage(article).src}
                      alt={getArticleImage(article).alt}
                    />
                    <div>
                      <div className="events-card__tags">
                        {article.tagIds.map((tid) => {
                          const t = getTagById(tid)
                          return t ? (
                            <span key={tid} className="events-card__tag">
                              {t.name}
                            </span>
                          ) : null
                        })}
                      </div>
                      <h2 className="events-card__title">{article.en!.title}</h2>
                      {article.event && (
                        <dl className="events-card__meta">
                          <dt>Venue</dt>
                          <dd>{getEnglishEventVenue(article)}</dd>
                          <dt>Dates</dt>
                          <dd>
                            {article.event.startDate} – {article.event.endDate}
                          </dd>
                          <dt>Price</dt>
                          <dd>{getEnglishEventPrice(article)}</dd>
                        </dl>
                      )}
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default Page
