"use client"

import { useState } from "react"
import { fmtRange } from "lib/format"
import { CalListItem } from "components/cal-list-item"

export type CategoryFilterEvent = {
  id: number
  slug: string
  title: string
  image?: { src: string; alt: string }
  event: {
    venue: string
    startDate: string
    endDate: string
  }
}

export type CategoryGroup = {
  id: string
  name: string
  events: CategoryFilterEvent[]
}

type Props = {
  groups: CategoryGroup[]
  hrefPrefix: string
  locale: "ja" | "en"
}

const LABELS = {
  ja: {
    filterLabel: "カテゴリで絞り込む",
    allLabel: "すべて",
    groupLabel: (name: string, count: number) => `${name}（${count}）`,
    emptyMessage: "カテゴリ別に表示できるイベントはありません。",
    dateSep: "〜",
  },
  en: {
    filterLabel: "Filter by category",
    allLabel: "All",
    groupLabel: (name: string, count: number) => `${name} (${count})`,
    emptyMessage: "No events to display by category.",
    dateSep: "–",
  },
}

export const TodayCategoryFilter = ({ groups, hrefPrefix, locale }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const L = LABELS[locale]

  if (groups.length === 0) {
    return <p className="events-page__empty">{L.emptyMessage}</p>
  }

  const visible = selectedId ? groups.filter((g) => g.id === selectedId) : groups

  return (
    <>
      <div className="today-venue-filter">
        <p className="today-venue-filter__label">{L.filterLabel}</p>
        <div className="today-venue-filter__list">
          <button
            className={`events-map__button${selectedId === null ? " events-map__button--active" : ""}`}
            onClick={() => setSelectedId(null)}
          >
            {L.allLabel}
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              className={`events-map__button${selectedId === g.id ? " events-map__button--active" : ""}`}
              onClick={() => setSelectedId(selectedId === g.id ? null : g.id)}
            >
              {L.groupLabel(g.name, g.events.length)}
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
                href={`${hrefPrefix}${a.slug}/`}
                image={a.image}
                dateTime={a.event.startDate}
                dateLabel={fmtRange(a.event.startDate, a.event.endDate, L.dateSep)}
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
