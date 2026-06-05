import Link from "next/link"
import { getAllArticles, getArticleImage, getEnglishEventVenue, getEnglishEventPrice } from "lib/articles"
import { absoluteUrl } from "lib/site"

const COLLAB_CAFE_TAG_IDS = [81, 57, 131, 82]

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

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} – ${e.slice(5).replace("-", "/")}`

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
            <li className="breadcrumb__item breadcrumb__item--current">Collab Cafes</li>
          </ol>
        </nav>

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

        <section className="today-section" aria-labelledby="ongoing-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ongoing</p>
            <h2 id="ongoing-heading" className="today-section__title">
              Ongoing Collab Cafes ({ongoing.length})
            </h2>
          </div>
          {ongoing.length === 0 ? (
            <p className="events-page__empty">No collab cafes currently open.</p>
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
              Upcoming Collab Cafes ({upcoming.length})
            </h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="events-page__empty">No upcoming collab cafes.</p>
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
