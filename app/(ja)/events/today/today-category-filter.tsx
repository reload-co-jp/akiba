"use client"

import { useState } from "react"
import Link from "next/link"

type CategoryEvent = {
  id: number
  title: string
  slug: string
  image?: { src: string; alt: string }
  event: {
    venue: string
    startDate: string
    endDate: string
  }
}

type CategoryGroup = {
  id: string
  name: string
  events: CategoryEvent[]
}

type Props = {
  groups: CategoryGroup[]
}

const PLACEHOLDER = { src: "/images/placeholder.jpg", alt: "アキバLiveの記事サムネイル" }

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} 〜 ${e.slice(5).replace("-", "/")}`

export const TodayCategoryFilter = ({ groups }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (groups.length === 0) {
    return <p className="events-page__empty">カテゴリ別に表示できるイベントはありません。</p>
  }

  const visible = selectedId ? groups.filter((g) => g.id === selectedId) : groups

  return (
    <>
      <div className="today-venue-filter">
        <p className="today-venue-filter__label">カテゴリで絞り込む</p>
        <div className="today-venue-filter__list">
          <button
            className={`events-map__button${selectedId === null ? " events-map__button--active" : ""}`}
            onClick={() => setSelectedId(null)}
          >
            すべて
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              className={`events-map__button${selectedId === g.id ? " events-map__button--active" : ""}`}
              onClick={() => setSelectedId(selectedId === g.id ? null : g.id)}
            >
              {g.name}（{g.events.length}）
            </button>
          ))}
        </div>
      </div>

      {visible.map((group) => (
        <div key={group.id} className="today-category">
          <h3 className="today-category__title">{group.name}</h3>
          <ul className="cal__list">
            {group.events.map((a) => {
              const img = a.image ?? PLACEHOLDER
              return (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}/`} className="cal__list-item">
                    <img className="cal__list-image" src={img.src} alt={img.alt} />
                    <time className="cal__list-date" dateTime={a.event.startDate}>
                      {fmtRange(a.event.startDate, a.event.endDate)}
                    </time>
                    <span className="cal__list-title">{a.title}</span>
                    <span className="cal__list-venue">{a.event.venue}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </>
  )
}
