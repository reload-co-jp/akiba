"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

// AdSense のページ遷移広告(インタースティシャル)は history の変化を監視して
// オーバーレイの開閉を制御している。Next.js の <Link> による client-side 遷移は
// DOM 更新が先行し、通知が間に合わず「閉じるボタンを1回押しても遷移だけして
// 広告が閉じない(2回目でようやく閉じる)」現象が起きることがある。
// pathname 変化のたびに popstate を明示的に再送し、遷移完了を通知する。
export function AdsenseRouteNotifier() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.dispatchEvent(new PopStateEvent("popstate"))
  }, [pathname])

  return null
}
