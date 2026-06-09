"use client"

import { useState } from "react"
import { fmtRange } from "lib/format"
import { CalListItem } from "components/cal-list-item"

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
            {group.events.map((a) => (
              <CalListItem
                key={a.id}
                href={`/articles/${a.slug}/`}
                image={a.image}
                dateTime={a.event.startDate}
                dateLabel={fmtRange(a.event.startDate, a.event.endDate)}
                title={a.title}
                venue={a.event.venue}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
