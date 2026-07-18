"use client"

import { useMemo, useState } from "react"
import type { Article } from "lib/articles"
import { mapBounds, getVenuePoint, type VenuePoint } from "lib/venue-points"

type Props = {
  events: Article[]
}

type MapLocation = VenuePoint & {
  key: string
  venue: string
  query: string
  articles: Article[]
}

const broadVenuePatterns = ["全国", "対象10店舗", "各店"]

const extractAddress = (content: string): string | undefined => {
  const addressLine = content.match(/- \*\*住所\*\*: ([^\n]+)/)
  return addressLine?.[1]?.trim()
}

const getPinPosition = ({ lat, lng }: VenuePoint) => ({
  left: `${((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100}%`,
  top: `${((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100}%`,
})

export const EventsMap = ({ events }: Props) => {
  const locations = useMemo(() => {
    const grouped = new Map<string, MapLocation>()

    for (const article of events) {
      if (!article.event) continue

      const venue = article.event.venue.trim()
      if (broadVenuePatterns.some((pattern) => venue.includes(pattern))) {
        continue
      }

      const point = getVenuePoint(venue)
      if (!point) continue

      const key = `${venue}-${point.lat}-${point.lng}`
      const address = extractAddress(article.content)
      const query = address ? `${venue} ${address}` : `${venue} 秋葉原`
      const existing = grouped.get(key)

      if (existing) {
        existing.articles.push(article)
      } else {
        grouped.set(key, {
          key,
          venue,
          query,
          ...point,
          articles: [article],
        })
      }
    }

    return Array.from(grouped.values())
  }, [events])

  const [selectedKey, setSelectedKey] = useState(locations[0]?.key)
  const selected = locations.find((location) => location.key === selectedKey) ?? locations[0]

  if (!selected) {
    return null
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.west}%2C${mapBounds.south}%2C${mapBounds.east}%2C${mapBounds.north}&layer=mapnik`
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.query)}`

  return (
    <section className="events-map" aria-labelledby="events-map-title">
      <div className="events-map__header">
        <p className="events-map__kicker">Event map</p>
        <h2 id="events-map-title">開催場所</h2>
      </div>
      <div className="events-map__frame">
        <iframe
          title="開催中イベントの地図"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
        />
        <div className="events-map__pins" aria-label="開催中イベントのピン">
          {locations.map((location, index) => (
            <button
              key={location.key}
              type="button"
              className={
                location.key === selected.key
                  ? "events-map__pin events-map__pin--active"
                  : "events-map__pin"
              }
              style={getPinPosition(location)}
              onClick={() => setSelectedKey(location.key)}
              aria-label={`${location.venue}のイベントを表示`}
            >
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="events-map__selected">
        <strong>{selected.venue}</strong>
        <span>{selected.articles.length}件のイベント開催中</span>
        <ul>
          {selected.articles.map((article) => (
            <li key={article.id}>{article.title}</li>
          ))}
        </ul>
        <a href={externalMapUrl} target="_blank" rel="noopener noreferrer">
          Google Mapsで開く
        </a>
      </div>
      <div className="events-map__buttons" aria-label="地図に表示する会場">
        {locations.map((location, index) => (
          <button
            key={location.key}
            type="button"
            className={
              location.key === selected.key
                ? "events-map__button events-map__button--active"
                : "events-map__button"
            }
            onClick={() => setSelectedKey(location.key)}
          >
            <span>{index + 1}. {location.venue}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
