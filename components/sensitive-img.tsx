"use client"

import { useState, type ImgHTMLAttributes, type KeyboardEvent, type MouseEvent } from "react"
import type { SensitiveImage } from "lib/articles"

type Props = ImgHTMLAttributes<HTMLImageElement> & { sensitive?: SensitiveImage }

// sensitive画像はカバー表示し、クリック時に初めて実画像を読み込む（リンク内でも遷移させない）
export default function SensitiveImg({ sensitive, ...props }: Props) {
  const [revealed, setRevealed] = useState(false)
  if (!sensitive) return <img {...props} alt={props.alt ?? ""} />
  if (revealed)
    return (
      <img
        {...props}
        src={sensitive.src}
        alt={sensitive.alt}
        width={sensitive.width}
        height={sensitive.height}
      />
    )
  const reveal = (e: MouseEvent | KeyboardEvent) => {
    if ("key" in e && e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    e.stopPropagation()
    setRevealed(true)
  }
  return (
    <span role="button" tabIndex={0} onClick={reveal} onKeyDown={reveal}>
      <img
        {...props}
        src="/images/sensitive-cover.svg"
        alt="センシティブな画像です。クリックで表示"
        title="クリックで表示"
        style={{ ...props.style, cursor: "pointer" }}
      />
    </span>
  )
}
