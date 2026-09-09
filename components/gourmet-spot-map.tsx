"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import "leaflet/dist/leaflet.css"
import type { DivIcon } from "leaflet"
import { mapBounds } from "lib/venue-points"
import { getCuisineLabel, hasDetailPage, type Spot } from "lib/spots"

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
})
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false })
const GsiTileLayer = dynamic(
  () => import("components/gsi-tile-layer").then((m) => m.GsiTileLayer),
  { ssr: false },
)

type Props = {
  spots: Spot[]
}

const PIN_SIZE = 16
const PIN_SIZE_ACTIVE = 20

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

  // 緯度経度→ピクセル位置の変換はLeafletに任せる(独自CSS計算はWebメルカトル図法の
  // 歪みを考慮できずズレるため)。leafletはwindow参照を含みSSR不可なのでクライアントでのみロード
  const [icons, setIcons] = useState<{ normal: DivIcon; active: DivIcon }>()
  useEffect(() => {
    let cancelled = false
    import("leaflet").then((L) => {
      if (cancelled) return
      setIcons({
        normal: new L.DivIcon({
          className: "gourmet-map__pin-icon",
          html: '<span class="gourmet-map__pin"></span>',
          iconSize: [PIN_SIZE, PIN_SIZE],
          iconAnchor: [PIN_SIZE / 2, PIN_SIZE],
        }),
        active: new L.DivIcon({
          className: "gourmet-map__pin-icon",
          html: '<span class="gourmet-map__pin gourmet-map__pin--active"></span>',
          iconSize: [PIN_SIZE_ACTIVE, PIN_SIZE_ACTIVE],
          iconAnchor: [PIN_SIZE_ACTIVE / 2, PIN_SIZE_ACTIVE],
        }),
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

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
          {icons &&
            pinned.map((spot) => (
              <Marker
                key={spot.id}
                position={[spot.lat!, spot.lng!]}
                icon={spot.id === selected.id ? icons.active : icons.normal}
                eventHandlers={{ click: () => setSelectedId(spot.id) }}
                alt={`${spot.name}を表示`}
              />
            ))}
        </MapContainer>
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
