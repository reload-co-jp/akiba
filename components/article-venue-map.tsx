"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import type { Icon } from "leaflet"

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
})
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false })
const GsiTileLayer = dynamic(() => import("./gsi-tile-layer").then((m) => m.GsiTileLayer), {
  ssr: false,
})

type Props = {
  venue: string
  lat: number
  lng: number
  query?: string
  mapLabel?: string
}

export const ArticleVenueMap = ({ venue, lat, lng, query, mapLabel }: Props) => {
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query ?? venue)}`

  // webpack経由だとLeafletデフォルトアイコンのパス解決が壊れるため、public配信の画像を明示指定
  // (leafletはwindow参照を含むためクライアント側でのみ動的にロードする)
  const [icon, setIcon] = useState<Icon>()
  useEffect(() => {
    let cancelled = false
    import("leaflet").then((L) => {
      if (cancelled) return
      setIcon(
        new L.Icon({
          iconUrl: "/leaflet/marker-icon.png",
          iconRetinaUrl: "/leaflet/marker-icon-2x.png",
          shadowUrl: "/leaflet/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="article-venue-map">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        aria-label={`${venue}の地図`}
      >
        <GsiTileLayer />
        {icon && <Marker position={[lat, lng]} icon={icon} />}
      </MapContainer>
      <a href={externalMapUrl} target="_blank" rel="noopener noreferrer">
        {mapLabel ?? "Google Mapsで開く"}
      </a>
    </div>
  )
}
