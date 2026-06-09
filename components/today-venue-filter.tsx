"use client"

import { useState } from "react"
import { fmtRange } from "lib/format"
import { EventCard } from "components/event-card"

export type VenueFilterEvent = {
  id: number
  slug: string
  title: string
  image?: { src: string; alt: string }
  tags: string[]
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
  events: VenueFilterEvent[]
  hrefPrefix: string
  locale: "ja" | "en"
}

const LABELS = {
  ja: {
    filterLabel: "会場で絞り込む",
    allLabel: (n: number) => `すべて（${n}件）`,
    emptyMessage: "本日開催中のイベントはありません。",
    showMoreLabel: (n: number) => `残り${n}件を表示`,
    cardLabels: { venue: "会場", dates: "期間", price: "料金" },
    dateSep: "〜",
  },
  en: {
    filterLabel: "Filter by venue",
    allLabel: (n: number) => `All (${n})`,
    emptyMessage: "No events today.",
    showMoreLabel: (n: number) => `Show ${n} more`,
    cardLabels: { venue: "Venue", dates: "Dates", price: "Price" },
    dateSep: "–",
  },
}

const INITIAL_LIMIT = 20

export const TodayVenueFilter = ({ events, hrefPrefix, locale }: Props) => {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const L = LABELS[locale]

  if (events.length === 0) {
    return <p className="events-page__empty">{L.emptyMessage}</p>
  }

  const venues = Array.from(new Set(events.map((e) => e.event.venue)))
  const filtered = selectedVenue ? events.filter((e) => e.event.venue === selectedVenue) : events
  const visible = showAll || selectedVenue ? filtered : filtered.slice(0, INITIAL_LIMIT)
  const hasMore = !showAll && !selectedVenue && filtered.length > INITIAL_LIMIT

  return (
    <>
      {venues.length > 1 && (
        <div className="today-venue-filter">
          <p className="today-venue-filter__label">{L.filterLabel}</p>
          <div className="today-venue-filter__list">
            <button
              className={`events-map__button${selectedVenue === null ? " events-map__button--active" : ""}`}
              onClick={() => setSelectedVenue(null)}
            >
              {L.allLabel(events.length)}
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
        {visible.map((ev) => (
          <EventCard
            key={ev.id}
            href={`${hrefPrefix}${ev.slug}/`}
            image={ev.image}
            title={ev.title}
            venue={ev.event.venue}
            dateRange={fmtRange(ev.event.startDate, ev.event.endDate, L.dateSep)}
            price={ev.event.price}
            tags={ev.tags}
            sourceUrl={ev.sourceUrl}
            sourceLabel={ev.sourceLabel}
            labels={L.cardLabels}
          />
        ))}
      </ul>
      {hasMore && (
        <button className="today-show-more" onClick={() => setShowAll(true)}>
          {L.showMoreLabel(filtered.length - INITIAL_LIMIT)}
        </button>
      )}
    </>
  )
}
