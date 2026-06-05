"use client"

import { useState } from "react"
import Link from "next/link"

type EnEvent = {
  id: number
  slug: string
  title: string
  image?: { src: string; alt: string }
  tagNames: string[]
  event: {
    venue: string
    startDate: string
    endDate: string
    price: string
  }
  sourceUrl?: string
  sourceLabel?: string
}

type Props = {
  events: EnEvent[]
}

const PLACEHOLDER = { src: "/images/placeholder.jpg", alt: "Akiba Live article thumbnail" }

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} – ${e.slice(5).replace("-", "/")}`

const INITIAL_LIMIT = 20

export const TodayVenueFilter = ({ events }: Props) => {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (events.length === 0) {
    return <p className="events-page__empty">No events today.</p>
  }

  const venues = Array.from(new Set(events.map((e) => e.event.venue)))
  const filtered = selectedVenue ? events.filter((e) => e.event.venue === selectedVenue) : events
  const visible = showAll || selectedVenue ? filtered : filtered.slice(0, INITIAL_LIMIT)
  const hasMore = !showAll && !selectedVenue && filtered.length > INITIAL_LIMIT

  return (
    <>
      {venues.length > 1 && (
        <div className="today-venue-filter">
          <p className="today-venue-filter__label">Filter by venue</p>
          <div className="today-venue-filter__list">
            <button
              className={`events-map__button${selectedVenue === null ? " events-map__button--active" : ""}`}
              onClick={() => setSelectedVenue(null)}
            >
              All ({events.length})
            </button>
            {venues.map((venue) => (
              <button
                key={venue}
                className={`events-map__button${selectedVenue === venue ? " events-map__button--active" : ""}`}
                onClick={() => setSelectedVenue(selectedVenue === venue ? null : venue)}
              >
                {venue}
              </button>
            ))}
          </div>
        </div>
      )}
      <ul className="events-list">
        {visible.map((ev) => {
          const img = ev.image ?? PLACEHOLDER
          return (
            <li key={ev.id}>
              <Link href={`/en/articles/${ev.slug}/`} className="events-card-link">
                <article className="events-card events-card--with-image">
                  <img className="events-card__image" src={img.src} alt={img.alt} />
                  <div>
                    <div className="events-card__tags">
                      {ev.tagNames.map((name) => (
                        <span key={name} className="events-card__tag">
                          {name}
                        </span>
                      ))}
                    </div>
                    <h3 className="events-card__title">{ev.title}</h3>
                    <dl className="events-card__meta">
                      <dt>Venue</dt>
                      <dd>{ev.event.venue}</dd>
                      <dt>Dates</dt>
                      <dd>{fmtRange(ev.event.startDate, ev.event.endDate)}</dd>
                      <dt>Price</dt>
                      <dd>{ev.event.price}</dd>
                    </dl>
                  </div>
                </article>
              </Link>
              {ev.sourceUrl && (
                <a
                  href={ev.sourceUrl}
                  className="today-official-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ↗ {ev.sourceLabel}
                </a>
              )}
            </li>
          )
        })}
      </ul>
      {hasMore && (
        <button className="today-show-more" onClick={() => setShowAll(true)}>
          Show {filtered.length - INITIAL_LIMIT} more
        </button>
      )}
    </>
  )
}
