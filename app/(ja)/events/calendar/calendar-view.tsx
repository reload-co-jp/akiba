"use client"

import { useState } from "react"
import Link from "next/link"
import { getArticleImage } from "lib/articles"
import type { Article } from "lib/articles"

type Props = { events: Article[]; maxEvents?: number }

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getMonthStartOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function formatRange(startDate: string, endDate: string) {
  const s = startDate.slice(5).replace("-", "/")
  const e = endDate.slice(5).replace("-", "/")
  return startDate === endDate ? s : `${s}〜${e}`
}

export const CalendarView = ({ events, maxEvents }: Props) => {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const todayStr = now.toISOString().slice(0, 10)
  const totalDays = getDaysInMonth(year, month)
  const offset = getMonthStartOffset(year, month)

  const monthStart = toDateStr(year, month, 1)
  const monthEnd = toDateStr(year, month, totalDays)

  const monthEvents = events
    .filter(
      (a) => a.event && a.event.startDate <= monthEnd && a.event.endDate >= monthStart,
    )
    .sort((a, b) => b.event!.startDate.localeCompare(a.event!.startDate))

  function getEventsForDay(dayStr: string) {
    return monthEvents.filter(
      (a) => a.event!.startDate <= dayStr && dayStr <= a.event!.endDate,
    )
  }

  function prevMonth() {
    setSelectedDate(null)
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    setSelectedDate(null)
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  function toggleDate(ds: string, hasEvents: boolean) {
    if (!hasEvents) return
    setSelectedDate((prev) => (prev === ds ? null : ds))
  }

  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const filteredEvents = selectedDate ? getEventsForDay(selectedDate) : monthEvents
  const listedEvents = maxEvents ? filteredEvents.slice(0, maxEvents) : filteredEvents
  const hasMore = maxEvents != null && filteredEvents.length > maxEvents
  const listHeading = selectedDate
    ? `${selectedDate.slice(5).replace("-", "/")} のイベント`
    : `${year}年${month + 1}月のイベント一覧`

  return (
    <section className="events-page">
      <div className="events-page__header">
        <p className="events-page__kicker">Event Calendar</p>
        <h1 className="events-page__title">イベントカレンダー</h1>
        <div className="cal__subtitle-row">
          <Link href="/events/today/" className="cal__today-btn">今日のイベントを見る →</Link>
          <Link href="/events/" className="cal__subtitle-link">開催中のイベント一覧</Link>
        </div>
      </div>

      <div className="cal">
        <div className="cal__nav">
          <button onClick={prevMonth} className="cal__nav-btn" aria-label="前の月">
            ‹
          </button>
          <span className="cal__month-label">
            {year}年{month + 1}月
          </span>
          <button onClick={nextMonth} className="cal__nav-btn" aria-label="次の月">
            ›
          </button>
        </div>

        <div className="cal__grid">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`cal__weekday${i === 5 ? " cal__weekday--sat" : i === 6 ? " cal__weekday--sun" : ""}`}
            >
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="cal__cell cal__cell--empty" />
            }
            const ds = toDateStr(year, month, day)
            const dayEvents = getEventsForDay(ds)
            const isToday = ds === todayStr
            const isSelected = ds === selectedDate
            const colIndex = (offset + day - 1) % 7
            return (
              <div
                key={ds}
                className={[
                  "cal__cell",
                  isToday ? "cal__cell--today" : "",
                  dayEvents.length > 0 ? "cal__cell--has-events" : "",
                  isSelected ? "cal__cell--selected" : "",
                  colIndex === 5 ? "cal__cell--sat" : "",
                  colIndex === 6 ? "cal__cell--sun" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  className="cal__day-num"
                  onClick={(e) => { e.stopPropagation(); toggleDate(ds, dayEvents.length > 0) }}
                  aria-pressed={isSelected || undefined}
                >
                  {day}
                </button>
                {dayEvents.length > 0 && (
                  <>
                    <span className="cal__day-count">{dayEvents.length}</span>
                    <ul className="cal__day-events" aria-label={`${day}日のイベント`}>
                      {dayEvents.slice(0, 5).map((e) => (
                        <li key={e.id} className="cal__day-event">
                          <span>{e.title}</span>
                        </li>
                      ))}
                      {dayEvents.length > 5 && (
                        <li className="cal__day-more">+{dayEvents.length - 5}</li>
                      )}
                    </ul>
                    <div className="cal__overlay" onClick={(e) => e.stopPropagation()}>
                      <p className="cal__overlay-date">
                        {month + 1}/{day}（{["月","火","水","木","金","土","日"][colIndex]}）
                      </p>
                      <ul className="cal__overlay-list">
                        {dayEvents.map((e) => (
                          <li key={e.id}>
                            <Link href={`/articles/${e.slug}/`} className="cal__overlay-item">
                              {e.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="cal__list-section">
          <div className="cal__list-header">
            <h2 className="cal__list-heading">{listHeading}</h2>
            {selectedDate && (
              <button className="cal__clear-btn" onClick={() => setSelectedDate(null)}>
                全て表示
              </button>
            )}
          </div>
          {listedEvents.length === 0 ? (
            <p className="events-page__empty">この日のイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {listedEvents.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}/`} className="cal__list-item">
                    <img
                      className="cal__list-image"
                      src={getArticleImage(a).src}
                      alt={getArticleImage(a).alt}
                    />
                    <time className="cal__list-date" dateTime={a.event!.startDate}>
                      {formatRange(a.event!.startDate, a.event!.endDate)}
                    </time>
                    <span className="cal__list-title">{a.title}</span>
                    <span className="cal__list-venue">{a.event!.venue}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {hasMore && (
            <Link href="/events/calendar/" className="cal__more-link">
              すべてのイベントを見る ({filteredEvents.length}件) →
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
