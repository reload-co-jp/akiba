"use client"

import { useState } from "react"
import Link from "next/link"
import type { Article } from "lib/articles"

type Props = {
  events: Article[]
  tagMap: Record<number, string>
}

const PLACEHOLDER = { src: "/images/placeholder.jpg", alt: "アキバLiveの記事サムネイル" }

const getImg = (article: Article) => article.image ?? PLACEHOLDER

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} 〜 ${e.slice(5).replace("-", "/")}`

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
          <li key={article.id}>
            <Link href={`/articles/${article.slug}/`} className="events-card-link">
              <article className="events-card events-card--with-image">
                <img
                  className="events-card__image"
                  src={getImg(article).src}
                  alt={getImg(article).alt}
                />
                <div>
                  <div className="events-card__tags">
                    {article.tagIds.map((tid) => {
                      const name = tagMap[tid]
                      return name ? (
                        <span key={tid} className="events-card__tag">{name}</span>
                      ) : null
                    })}
                  </div>
                  <h3 className="events-card__title">{article.title}</h3>
                  {article.event && (
                    <dl className="events-card__meta">
                      <dt>会場</dt>
                      <dd>{article.event.venue}</dd>
                      <dt>期間</dt>
                      <dd>{fmtRange(article.event.startDate, article.event.endDate)}</dd>
                      <dt>料金</dt>
                      <dd>{article.event.price}</dd>
                    </dl>
                  )}
                </div>
              </article>
            </Link>
            {article.sources?.[0]?.url && (
              <a
                href={article.sources[0].url}
                className="today-official-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ {article.sources[0].label}
              </a>
            )}
          </li>
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
