"use client"

import { useEffect } from "react"

const AdsenseInArticleAd = () => {
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
      style={{ display: "block", textAlign: "center" }}
      data-ad-layout="in-article"
      data-ad-format="fluid"
      data-ad-client="ca-pub-6542845006087970"
      data-ad-slot="4625326006"
    />
  )
}

export default AdsenseInArticleAd
