"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const AdsenseDisplayAd = ({ small = false }: { small?: boolean }) => {
  // layout に置いた広告は client-side 遷移で再マウントされず、広告リクエストが
  // 初回ページしか発生しない。パス毎に <ins> を作り直して再リクエストする。
  const pathname = usePathname()

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense can be unavailable in local previews or blocked browsers.
    }
  }, [pathname])

  return (
    <ins
      key={pathname}
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
