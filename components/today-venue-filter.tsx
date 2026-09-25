"use client"

import { useEffect, useState } from "react"
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
  mapSlot?: React.ReactNode
}

const LABELS = {
  ja: {
    filterLabel: "会場で絞り込む",
    filterButtonAll: "会場で絞り込む",
    filterButtonSelected: (venue: string) => `会場：${venue}`,
    closeLabel: "閉じる",
    allLabel: (n: number) => `すべて（${n}件）`,
    emptyMessage: "本日開催中のイベントはありません。",
    showMoreLabel: (n: number) => `残り${n}件を表示`,
    cardLabels: { venue: "会場", dates: "期間", price: "料金" },
    dateSep: "〜",
  },
  en: {
    filterLabel: "Filter by venue",
    filterButtonAll: "Filter by venue",
    filterButtonSelected: (venue: string) => `Venue: ${venue}`,
    closeLabel: "Close",
    allLabel: (n: number) => `All (${n})`,
    emptyMessage: "No events today.",
    showMoreLabel: (n: number) => `Show ${n} more`,
    cardLabels: { venue: "Venue", dates: "Dates", price: "Price" },
    dateSep: "–",
  },
}

const INITIAL_LIMIT = 20

export const TodayVenueFilter = ({
  events,
  hrefPrefix,
  locale,
  mapSlot,
}: Props) => {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const L = LABELS[locale]

  useEffect(() => {
    if (!isModalOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsModalOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isModalOpen])

  if (events.length === 0) {
    return <p className="events-page__empty">{L.emptyMessage}</p>
  }

  const venues = Array.from(new Set(events.map((e) => e.event.venue)))
  const filtered = selectedVenue
    ? events.filter((e) => e.event.venue === selectedVenue)
    : events
  const visible =
    showAll || selectedVenue ? filtered : filtered.slice(0, INITIAL_LIMIT)
  const hasMore = !showAll && !selectedVenue && filtered.length > INITIAL_LIMIT

  const selectVenue = (venue: string | null) => {
    setSelectedVenue(venue)
    setIsModalOpen(false)
  }

  return (
    <>
      {venues.length > 1 && (
        <div className="today-venue-filter">
          <p
            style={{
              color: "#5f6f69",
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            {L.filterLabel}
          </p>
          <button
            type="button"
            className="today-venue-filter__trigger"
            onClick={() => setIsModalOpen(true)}
            aria-haspopup="dialog"
          >
            {selectedVenue
              ? L.filterButtonSelected(selectedVenue)
              : L.filterButtonAll}
          </button>

          {isModalOpen && (
            <div
              style={{
                alignItems: "center",
                background: "rgba(15, 23, 42, 0.5)",
                display: "flex",
                inset: "0",
                justifyContent: "center",
                padding: "1.5rem",
                position: "fixed",
                zIndex: "1200",
              }}
              role="dialog"
              aria-modal="true"
              aria-label={L.filterLabel}
            >
              <button
                type="button"
                style={{
                  background: "transparent",
                  border: "0",
                  inset: "0",
                  padding: "0",
                  position: "absolute",
                }}
                onClick={() => setIsModalOpen(false)}
                aria-label={L.closeLabel}
              />
              <div
                style={{
                  background: "#fffdf8",
                  borderRadius: "12px",
                  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.3)",
                  maxHeight: "calc(100vh - 3rem)",
                  maxWidth: "480px",
                  overflowY: "auto",
                  padding: "1.25rem",
                  position: "relative",
                  width: "100%",
                  zIndex: "1",
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p
                    style={{
                      color: "#24312f",
                      fontSize: "0.9375rem",
                      fontWeight: "700",
                      margin: "0",
                    }}
                  >
                    {L.filterLabel}
                  </p>
                  <button
                    type="button"
                    style={{
                      background: "none",
                      border: "0",
                      color: "#5f6f69",
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: "0.8125rem",
                      fontWeight: "700",
                      padding: "0.25rem 0.5rem",
                    }}
                    onClick={() => setIsModalOpen(false)}
                  >
                    {L.closeLabel}
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  <button
                    className={`events-map__button${selectedVenue === null ? " events-map__button--active" : ""}`}
                    onClick={() => selectVenue(null)}
                  >
                    {L.allLabel(events.length)}
                  </button>
                  {venues.map((venue) => (
                    <button
                      key={venue}
                      className={`events-map__button${selectedVenue === venue ? " events-map__button--active" : ""}`}
                      onClick={() =>
                        selectVenue(selectedVenue === venue ? null : venue)
                      }
                    >
                      {venue}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {mapSlot}
      <ul className="events-list events-list--grid">
        {visible.map((ev) => (
          <EventCard
            key={ev.id}
            href={`${hrefPrefix}${ev.slug}/`}
            image={ev.image}
            title={ev.title}
            venue={ev.event.venue}
            dateRange={fmtRange(
              ev.event.startDate,
              ev.event.endDate,
              L.dateSep
            )}
            price={ev.event.price}
            tags={ev.tags}
            sourceUrl={ev.sourceUrl}
            sourceLabel={ev.sourceLabel}
            labels={L.cardLabels}
            layout="grid"
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
