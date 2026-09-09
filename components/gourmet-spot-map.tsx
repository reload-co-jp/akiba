"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import { mapBounds } from "lib/venue-points"
import { getCuisineLabel, hasDetailPage, type Spot } from "lib/spots"

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
})
const GsiTileLayer = dynamic(
  () => import("components/gsi-tile-layer").then((m) => m.GsiTileLayer),
  { ssr: false },
)

type Props = {
  spots: Spot[]
}

const getPinPosition = (spot: Spot) => ({
  left: `${((spot.lng! - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100}%`,
  top: `${((mapBounds.north - spot.lat!) / (mapBounds.north - mapBounds.south)) * 100}%`,
})

/**
 * Pins every gourmet spot on the map — with 500+ bulk-imported entries,
 * that's unreadable — so this only plots the tier-A spots that have their
 * own detail page, and links to it from the selected-spot panel.
 */
export const GourmetSpotMap = ({ spots }: Props) => {
  const pinned = useMemo(
    () => spots.filter((s) => hasDetailPage(s) && s.lat != null && s.lng != null),
    [spots],
  )

  const [selectedId, setSelectedId] = useState(pinned[0]?.id)
  const selected = pinned.find((s) => s.id === selectedId) ?? pinned[0]

  if (!selected) {
    return null
  }

  return (
    <section className="gourmet-map" aria-labelledby="gourmet-map-title">
      <div className="gourmet-map__header">
        <p className="gourmet-map__kicker">Gourmet map</p>
        <h2 id="gourmet-map-title">お店の場所</h2>
      </div>
      <div className="gourmet-map__frame">
        <MapContainer
          bounds={[
            [mapBounds.south, mapBounds.west],
            [mapBounds.north, mapBounds.east],
          ]}
          dragging={false}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
          touchZoom={false}
          aria-label="秋葉原グルメスポットの地図"
        >
          <GsiTileLayer />
        </MapContainer>
        <div className="gourmet-map__pins" aria-label="詳細ページがある店舗のピン">
          {pinned.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className={
                spot.id === selected.id
                  ? "gourmet-map__pin gourmet-map__pin--active"
                  : "gourmet-map__pin"
              }
              style={getPinPosition(spot)}
              onClick={() => setSelectedId(spot.id)}
              aria-label={`${spot.name}を表示`}
            />
          ))}
        </div>
      </div>
      <div className="gourmet-map__selected">
        <strong>{selected.name}</strong>
        {selected.cuisine && selected.cuisine.length > 0 && (
          <span>{selected.cuisine.map(getCuisineLabel).join("／")}</span>
        )}
        {selected.address && <span>{selected.address}</span>}
        <Link href={`/spots/${selected.slug}/`}>詳細を見る</Link>
      </div>
    </section>
  )
}
