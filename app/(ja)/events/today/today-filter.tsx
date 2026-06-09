"use client"

import { useState } from "react"
import type { Article } from "lib/articles"
import { getArticleImage } from "lib/articles"
import { fmtRange } from "lib/format"
import { EventCard } from "components/event-card"

type Props = {
  events: Article[]
  tagMap: Record<number, string>
}

const INITIAL_LIMIT = 20

export const TodayVenueFilter = ({ events, tagMap }: Props) => {
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (events.length === 0) {
    return <p className="events-page__empty">本日開催中のイベントはありません。</p>
  }

  const venues = Array.from(new Set(events.map((e) => e.event!.venue)))
  const filtered = selectedVenue ? events.filter((e) => e.event!.venue === selectedVenue) : events
  const visible = showAll || selectedVenue ? filtered : filtered.slice(0, INITIAL_LIMIT)
  const hasMore = !showAll && !selectedVenue && filtered.length > INITIAL_LIMIT

  return (
    <>
      {venues.length > 1 && (
        <div className="today-venue-filter">
          <p className="today-venue-filter__label">会場で絞り込む</p>
          <div className="today-venue-filter__list">
            <button
              className={`events-map__button${selectedVenue === null ? " events-map__button--active" : ""}`}
              onClick={() => setSelectedVenue(null)}
            >
              すべて（{events.length}件）
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
        {visible.map((article) => (
          <EventCard
            key={article.id}
            href={`/articles/${article.slug}/`}
            image={getArticleImage(article)}
            title={article.title}
            venue={article.event!.venue}
            dateRange={fmtRange(article.event!.startDate, article.event!.endDate)}
            price={article.event!.price}
            tags={article.tagIds.flatMap((tid) => (tagMap[tid] ? [tagMap[tid]] : []))}
            sourceUrl={article.sources?.[0]?.url}
            sourceLabel={article.sources?.[0]?.label}
          />
        ))}
      </ul>
      {hasMore && (
        <button className="today-show-more" onClick={() => setShowAll(true)}>
          残り{filtered.length - INITIAL_LIMIT}件を表示
        </button>
      )}
    </>
  )
}
