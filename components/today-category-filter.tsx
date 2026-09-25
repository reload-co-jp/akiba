"use client"

import { useState } from "react"
import { fmtRange } from "lib/format"
import { EventCard } from "components/event-card"

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

  const visible = selectedId
    ? groups.filter((g) => g.id === selectedId)
    : groups

  return (
    <>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
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
        <div key={group.id} style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              color: "#3f5851",
              fontSize: "0.875rem",
              fontWeight: "700",
              margin: "0 0 0.5rem",
            }}
          >
            {group.name}
          </h3>
          <ul className="events-list events-list--grid">
            {group.events.map((a) => (
              <EventCard
                key={a.id}
                href={`${hrefPrefix}${a.slug}/`}
                image={a.image}
                title={a.title}
                venue={a.event.venue}
                dateRange={fmtRange(
                  a.event.startDate,
                  a.event.endDate,
                  L.dateSep
                )}
                layout="grid"
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}
