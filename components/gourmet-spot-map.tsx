"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { mapBounds } from "lib/venue-points"
import { getCuisineLabel, hasDetailPage, type Spot } from "lib/spots"

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

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.west}%2C${mapBounds.south}%2C${mapBounds.east}%2C${mapBounds.north}&layer=mapnik`

  return (
    <section className="gourmet-map" aria-labelledby="gourmet-map-title">
      <div className="gourmet-map__header">
        <p className="gourmet-map__kicker">Gourmet map</p>
        <h2 id="gourmet-map-title">お店の場所</h2>
      </div>
      <div className="gourmet-map__frame">
        <iframe
          title="秋葉原グルメスポットの地図"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          tabIndex={-1}
        />
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
