"use client"

import { TileLayer } from "react-leaflet"

// 国土地理院 淡色地図タイル
export const GSI_PALE_TILE_URL = "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
export const GSI_ATTRIBUTION =
  '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>'

export const GsiTileLayer = () => (
  <TileLayer url={GSI_PALE_TILE_URL} attribution={GSI_ATTRIBUTION} maxZoom={18} />
)
