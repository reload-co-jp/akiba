"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import type { DivIcon } from "leaflet"
import type { Article } from "lib/articles"
import { getArticleImage } from "lib/articles"
import { mapBounds, getVenuePoint, type VenuePoint } from "lib/venue-points"

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
})
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false })
const GsiTileLayer = dynamic(
  () => import("components/gsi-tile-layer").then((m) => m.GsiTileLayer),
  { ssr: false },
)

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

const PIN_SIZE = 44
const PIN_SIZE_ACTIVE = 56

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

  // 全マーカーがギリギリ収まるズームにするため、開催中の会場座標からboundsを算出
  // (固定の秋葉原全域boundsだと開催数が少ない日にズームアウトしすぎる)
  const fitBounds = useMemo((): [[number, number], [number, number]] => {
    if (locations.length === 0) {
      return [
        [mapBounds.south, mapBounds.west],
        [mapBounds.north, mapBounds.east],
      ]
    }
    const lats = locations.map((location) => location.lat)
    const lngs = locations.map((location) => location.lng)
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]
  }, [locations])

  // 緯度経度→ピクセル位置の変換はLeafletに任せる(独自CSS計算はWebメルカトル図法の
  // 歪みを考慮できずズレるため)。leafletはwindow参照を含みSSR不可なのでクライアントでのみロード
  const [L, setL] = useState<typeof import("leaflet")>()
  useEffect(() => {
    let cancelled = false
    import("leaflet").then((mod) => {
      if (!cancelled) setL(mod)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const makeIcon = (index: number, active: boolean, imageSrc: string): DivIcon | undefined => {
    if (!L) return undefined
    const size = active ? PIN_SIZE_ACTIVE : PIN_SIZE
    return new L.DivIcon({
      className: "events-map__pin-icon",
      html: `<span class="events-map__pin${active ? " events-map__pin--active" : ""}"><img src="${imageSrc}" alt="" /><span>${index + 1}</span></span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    })
  }

  if (!selected) {
    return null
  }

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.query)}`

  return (
    <section className="events-map" aria-labelledby="events-map-title">
      <div className="events-map__header">
        <p className="events-map__kicker">Event map</p>
        <h2 id="events-map-title">開催場所</h2>
      </div>
      <div className="events-map__frame">
        <MapContainer
          bounds={fitBounds}
          boundsOptions={{ padding: [16, 16] }}
          scrollWheelZoom={false}
          aria-label="開催中イベントの地図"
        >
          <GsiTileLayer />
          {L &&
            locations.map((location, index) => (
              <Marker
                key={location.key}
                position={[location.lat, location.lng]}
                icon={makeIcon(
                  index,
                  location.key === selected.key,
                  getArticleImage(location.articles[0]).src,
                )}
                eventHandlers={{ click: () => setSelectedKey(location.key) }}
                alt={`${location.venue}のイベントを表示`}
              />
            ))}
        </MapContainer>
      </div>
      <div className="events-map__selected">
        <img
          className="events-map__selected-image"
          src={getArticleImage(selected.articles[0]).src}
          alt=""
        />
        <div className="events-map__selected-body">
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
      </div>
    </section>
  )
}
