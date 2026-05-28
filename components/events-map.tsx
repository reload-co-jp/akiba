"use client"

import { useMemo, useState } from "react"
import type { Article } from "lib/articles"

type Props = {
  events: Article[]
}

type VenuePoint = {
  lat: number
  lng: number
}

type MapLocation = VenuePoint & {
  key: string
  venue: string
  query: string
  articles: Article[]
}

const mapBounds = {
  north: 35.706,
  south: 35.6934,
  east: 139.7786,
  west: 139.767,
}

const venuePoints: Record<string, VenuePoint> = {
  "アトレ秋葉原1": { lat: 35.6984, lng: 139.7731 },
  "アトレ秋葉原2": { lat: 35.6981, lng: 139.7742 },
  "バンダイナムコ Cross Store アトレ秋葉原店": { lat: 35.6984, lng: 139.7731 },
  "秋葉原ダイビル": { lat: 35.6999, lng: 139.7729 },
  "ワテラス": { lat: 35.6977, lng: 139.7679 },
  "WATERRAS（ワテラス）": { lat: 35.6977, lng: 139.7679 },
  "ものづくり館 by YKK": { lat: 35.6985, lng: 139.7767 },
  "秋葉原・損保会館": { lat: 35.6969, lng: 139.7685 },
  "秋葉原UDX": { lat: 35.7003, lng: 139.7726 },
  "秋葉原UDXシアター": { lat: 35.7001, lng: 139.7726 },
  "神田明神ホール": { lat: 35.7017, lng: 139.7677 },
  "書泉ブックタワー": { lat: 35.6976, lng: 139.7745 },
  "AKIBA FAN CUBE": { lat: 35.6988, lng: 139.7716 },
  "AKIBAカルチャーズZONE 4階 カルポップ": { lat: 35.6995, lng: 139.7716 },
  "あみあみ秋葉原フィギュアタワー店": { lat: 35.6992, lng: 139.772 },
  "秋葉原 SEEKBASE": { lat: 35.7011, lng: 139.7767 },
  "2k540 AKI-OKA ARTISAN": { lat: 35.7054, lng: 139.7737 },
  "2k540 AKI-OKA ARTISAN イベントスペースC": { lat: 35.7054, lng: 139.7737 },
  "2k540 AKI-OKA ARTISAN イベントスペースC・D": { lat: 35.7054, lng: 139.7737 },
  "ボークス 秋葉原ホビー天国2": { lat: 35.7005, lng: 139.7714 },
  "コラボカフェ本舗 秋葉原店": { lat: 35.7003, lng: 139.7715 },
  "キュアメイドカフェ": { lat: 35.6982, lng: 139.771 },
  "AKIHABARAゲーマーズ本店": { lat: 35.699, lng: 139.7714 },
  "メロンブックス秋葉原1号店": { lat: 35.6987, lng: 139.7718 },
  "秋葉原Venus": { lat: 35.701, lng: 139.7716 },
  "秋葉原COSMICLAB": { lat: 35.7021, lng: 139.7715 },
  "秋葉原ZEST": { lat: 35.7007, lng: 139.7706 },
  "秋葉原CLUB GOODMAN": { lat: 35.6977, lng: 139.7738 },
  "秋葉原ティア": { lat: 35.701, lng: 139.7716 },
  "SOUNDNOTE AKIHABARA": { lat: 35.7019, lng: 139.7783 },
  "秋葉原Galaxy": { lat: 35.702, lng: 139.7714 },
  "アキバCOギャラリー": { lat: 35.7017, lng: 139.7716 },
  "アニメイト秋葉原2号館 7F": { lat: 35.6997, lng: 139.7714 },
  "アニメイト秋葉原ANNEX": { lat: 35.7001, lng: 139.7714 },
  "TOPPA!!! BASE AKIBA": { lat: 35.6984, lng: 139.773 },
  "コトブキヤ秋葉原店 5F": { lat: 35.6994, lng: 139.7711 },
  "コトブキヤ秋葉原館2階": { lat: 35.6994, lng: 139.7711 },
  "GiGO秋葉原5号館 Akib@ko": { lat: 35.6991, lng: 139.7719 },
  "秋葉原 グランエンタス（オノデン1F）": { lat: 35.6982, lng: 139.7728 },
  "LIVE HOUSE＆CLUB ANTHEM AKIBA": { lat: 35.7007, lng: 139.7695 },
  "AIR 3331 岩本町レジデンス＆スタジオ 1階": { lat: 35.6947, lng: 139.7772 },
  "RAKU SPA 1010 神田": { lat: 35.6966, lng: 139.7684 },
  "ファーストキャビン秋葉原": { lat: 35.6968, lng: 139.778 },
  "ブラウンダスト2 SHOP": { lat: 35.6985, lng: 139.7707 },
  "ネコリパブリック 東京 お茶の水店": { lat: 35.7032, lng: 139.7688 },
  "モンハン酒場 東京・秋葉原": { lat: 35.6978, lng: 139.7714 },
  "BEEP秋葉原店": { lat: 35.7009, lng: 139.7712 },
}

const broadVenuePatterns = ["全国", "対象10店舗", "各店"]

const extractAddress = (content: string): string | undefined => {
  const addressLine = content.match(/- \*\*住所\*\*: ([^\n]+)/)
  return addressLine?.[1]?.trim()
}

const getVenuePoint = (venue: string): VenuePoint | undefined => {
  if (venuePoints[venue]) return venuePoints[venue]

  const matchedVenue = Object.keys(venuePoints).find((knownVenue) =>
    venue.includes(knownVenue),
  )
  return matchedVenue ? venuePoints[matchedVenue] : undefined
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
