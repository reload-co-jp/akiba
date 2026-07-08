"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const AdsenseFluidAd = () => {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense can be unavailable in local previews or blocked browsers.
    }
  }, [])

  return (
    <aside
      className="article-fluid-ad"
      aria-label="広告"
      style={{ maxWidth: "960px", margin: "0 auto" }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-6j+c9+3p+h+19"
        data-ad-client="ca-pub-6542845006087970"
        data-ad-slot="1661618957"
      />
    </aside>
  )
}

export default AdsenseFluidAd
