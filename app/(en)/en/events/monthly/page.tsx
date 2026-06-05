import Link from "next/link"
import { getAllArticles, getArticleImage, getEnglishEventVenue } from "lib/articles"
import { absoluteUrl } from "lib/site"

export const metadata = {
  title: "Akihabara Event Calendar by Month | Anime, Games, Collab Cafe",
  description:
    "Browse Akihabara events by month. Anime, games, collab cafes, and popup stores — monthly schedule with venue and dates.",
  alternates: {
    canonical: "/en/events/monthly/",
    languages: {
      "x-default": "/en/events/monthly/",
      ja: "/events/monthly/",
      "ja-JP": "/events/monthly/",
      en: "/en/events/monthly/",
      "en-US": "/en/events/monthly/",
    },
  },
  openGraph: {
    title: "Akihabara Event Calendar by Month | Anime, Games, Collab Cafe",
    description:
      "Browse Akihabara events by month — monthly schedule with venue and dates.",
    url: "/en/events/monthly/",
    type: "website",
    locale: "en_US",
  },
}

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} – ${e.slice(5).replace("-", "/")}`

const fmtMonthLabel = (ym: string) => {
  const [y, m] = ym.split("-")
  const date = new Date(Number(y), Number(m) - 1, 1)
  return date.toLocaleString("en-US", { month: "long", year: "numeric" })
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const allEvents = getAllArticles().filter((a) => a.event != null && a.en)

  const monthMap = new Map<string, typeof allEvents>()
  for (const a of allEvents) {
    const month = a.event!.startDate.slice(0, 7)
    if (month >= currentMonth) {
      if (!monthMap.has(month)) monthMap.set(month, [])
      monthMap.get(month)!.push(a)
    }
  }

  const months = Array.from(monthMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

  const pageUrl = absoluteUrl("/en/events/monthly/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
        { "@type": "ListItem", position: 2, name: "Events", item: absoluteUrl("/en/events/") },
        { "@type": "ListItem", position: 3, name: "Monthly Calendar", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "Akihabara Event Calendar by Month",
      description:
        "Browse Akihabara events by month. Anime, games, collab cafes, and popup stores.",
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
            <li className="breadcrumb__item breadcrumb__item--current">Monthly Calendar</li>
          </ol>
        </nav>

        <header className="events-page__header">
          <p className="events-page__kicker">Monthly Event Calendar</p>
          <h1 className="events-page__title">Akihabara Event Calendar by Month</h1>
        </header>

        {months.length === 0 ? (
          <p className="events-page__empty">No upcoming events.</p>
        ) : (
          months.map(([ym, events]) => (
            <section key={ym} className="today-section" aria-labelledby={`month-${ym}`}>
              <div className="today-section__header">
                <h2 id={`month-${ym}`} className="today-section__title">
                  {fmtMonthLabel(ym)}
                  <span className="today-month-count"> ({events.length})</span>
                </h2>
              </div>
              <ul className="cal__list">
                {events.map((a) => (
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
            </section>
          ))
        )}

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
