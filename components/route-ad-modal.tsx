"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import AdsenseDisplayAd from "components/adsense-display-ad"

// client-side 遷移2回に1回、全画面モーダルでディスプレイ広告とおすすめリンクを出す。初回ロードは除外。
// <dialog> は showModal 前に子の useEffect(adsbygoogle.push)が走り幅0で失敗するため div で描画。
export function RouteAdModal({
  links,
  heading,
}: {
  links: { href: string; title: string }[]
  heading: string
}) {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const navCount = useRef(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname
    navCount.current += 1
    if (navCount.current % 2 === 0) setOpen(true)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("keydown", onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 16,
        background: "rgba(0, 0, 0, 0.85)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close"
        style={{
          alignSelf: "flex-end",
          padding: "8px 16px",
          border: "1px solid #fff",
          borderRadius: 4,
          background: "transparent",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <div style={{ width: "100%", maxWidth: 728, background: "#fff" }}>
        <AdsenseDisplayAd key={pathname} />
      </div>
      <nav
        style={{
          width: "100%",
          maxWidth: 728,
          maxHeight: "40dvh",
          overflowY: "auto",
          padding: 16,
          background: "#fff",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: 8 }}>{heading}</p>
        <ul style={{ display: "grid", gap: 8 }}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={() => setOpen(false)}>
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
