import Link from "next/link"
import { getAllArticles, getArticleImage, getEnglishEventVenue, getEnglishEventPrice } from "lib/articles"
import { absoluteUrl } from "lib/site"

const POPUP_TAG_IDS = [17, 128, 129, 196, 54, 62]

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

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} – ${e.slice(5).replace("-", "/")}`

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
      description:
        "Popup stores and limited shops currently open and upcoming in Akihabara.",
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
    })),
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
            <li className="breadcrumb__item breadcrumb__item--current">Popup Stores</li>
          </ol>
        </nav>

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

        <section className="today-section" aria-labelledby="ongoing-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ongoing</p>
            <h2 id="ongoing-heading" className="today-section__title">
              Ongoing Popup Stores ({ongoing.length})
            </h2>
          </div>
          {ongoing.length === 0 ? (
            <p className="events-page__empty">No popup stores currently open.</p>
          ) : (
            <ul className="events-list">
              {ongoing.map((a) => (
                <li key={a.id}>
                  <Link href={`/en/articles/${a.slug}/`} className="events-card-link">
                    <article className="events-card events-card--with-image">
                      <img
                        className="events-card__image"
                        src={getArticleImage(a).src}
                        alt={getArticleImage(a).alt}
                      />
                      <div>
                        <h3 className="events-card__title">{a.en!.title}</h3>
                        <dl className="events-card__meta">
                          <dt>Venue</dt>
                          <dd>{getEnglishEventVenue(a)}</dd>
                          <dt>Dates</dt>
                          <dd>{fmtRange(a.event!.startDate, a.event!.endDate)}</dd>
                          <dt>Price</dt>
                          <dd>{getEnglishEventPrice(a)}</dd>
                        </dl>
                      </div>
                    </article>
                  </Link>
                  {a.sources?.[0]?.url && (
                    <a
                      href={a.sources[0].url}
                      className="today-official-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ↗ {a.sources[0].label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="today-section" aria-labelledby="upcoming-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Upcoming</p>
            <h2 id="upcoming-heading" className="today-section__title">
              Upcoming Popup Stores ({upcoming.length})
            </h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="events-page__empty">No upcoming popup stores.</p>
          ) : (
            <ul className="cal__list">
              {upcoming.map((a) => (
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
        </section>
      </div>
    </>
  )
}

export default Page
