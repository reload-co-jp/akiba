"use client"

import { useEffect, useState } from "react"

type Props = {
  src: string
  alt: string
}

export function ArticleImagePreview({ src, alt }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        className="article-hero-image__button"
        onClick={() => setIsOpen(true)}
        aria-label="画像を拡大表示"
      >
        <img src={src} alt={alt} />
      </button>

      {isOpen && (
        <div
          className="article-image-preview"
          role="dialog"
          aria-modal="true"
          aria-label="画像プレビュー"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="article-image-preview__close"
            onClick={() => setIsOpen(false)}
            aria-label="画像プレビューを閉じる"
          >
            閉じる
          </button>
          <img
            src={src}
            alt={alt}
            className="article-image-preview__image"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
