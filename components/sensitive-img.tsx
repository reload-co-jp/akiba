"use client"

import { useState, type ImgHTMLAttributes, type MouseEvent } from "react"
import type { SensitiveImage } from "lib/articles"

type Props = ImgHTMLAttributes<HTMLImageElement> & { sensitive?: SensitiveImage }

// sensitive画像はカバー表示し、クリック時に初めて実画像を読み込む（リンク内でも遷移させない）
export default function SensitiveImg({ sensitive, ...props }: Props) {
  const [revealed, setRevealed] = useState(false)
  if (!sensitive) return <img {...props} />
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
  const reveal = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setRevealed(true)
  }
  return (
    <img
      {...props}
      src="/images/sensitive-cover.svg"
      alt="センシティブな画像です。クリックで表示"
      title="クリックで表示"
      style={{ ...props.style, cursor: "pointer" }}
      onClick={reveal}
    />
  )
}
