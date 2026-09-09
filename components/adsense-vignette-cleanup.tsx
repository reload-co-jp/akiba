"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// AdSense のページ遷移広告(インタースティシャル/vignette)は、表示中
// <body> に aria-hidden="true" と style="padding:0;top:-Npx"(元のスクロール
// 位置を固定表示するためのオフセット)を直接付与し、URL に #google_vignette
// を付与する。このクリーンアップはフルページロード完了を前提にしており、
// Next.js の client-side 遷移(pushState)ではタイミングが合わず、閉じるボタン
// を1回押しても遷移するだけで aria-hidden/style が残留し、広告が見た目上
// 閉じない(2回目のクリックでようやく解消される)ことがある。
// ルート変更のたびに残留状態を強制的に後始末する。
export function AdsenseVignetteCleanup() {
  const pathname = usePathname()

  useEffect(() => {
    const body = document.body
    if (!body) return

    if (body.getAttribute("aria-hidden") === "true") {
      body.removeAttribute("aria-hidden")
    }
    body.style.removeProperty("top")
    body.style.removeProperty("padding")

    if (window.location.hash === "#google_vignette") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      )
    }
  }, [pathname])

  return null
}
