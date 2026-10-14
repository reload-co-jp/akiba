"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const AdsenseDisplayAd = ({ small = false }: { small?: boolean }) => {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense can be unavailable in local previews or blocked browsers.
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-6542845006087970"
      data-ad-slot="4829146611"
      data-ad-format={small ? "horizontal" : "auto"}
      data-full-width-responsive={small ? "false" : "true"}
    />
  )
}

export default AdsenseDisplayAd
