"use client"

import { useRef } from "react"
import Link from "next/link"
import type { Article } from "lib/articles"
import { getArticleImage } from "lib/articles"

export function HomeNewsCarousel({ articles }: { articles: Article[] }) {
  const trackRef = useRef<HTMLUListElement>(null)

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector("li")
    const amount = card ? card.clientWidth + 16 : track.clientWidth
    track.scrollBy({ left: amount * direction, behavior: "smooth" })
  }

  if (articles.length === 0) return null

  return (
    <section className="home-carousel" aria-label="新着記事">
      <button
        type="button"
        className="home-carousel__nav home-carousel__nav--prev"
        onClick={() => scrollByCard(-1)}
        aria-label="前の記事"
      >
        ‹
      </button>
      <ul className="home-carousel__track" ref={trackRef}>
        {articles.map((article) => {
          const image = getArticleImage(article)
          return (
            <li key={article.id} className="home-carousel__item">
              <Link
                href={`/articles/${article.slug}/`}
                className="home-carousel__link"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="home-carousel__image"
                  loading="eager"
                  decoding="async"
                />
                <span className="home-carousel__title">{article.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        className="home-carousel__nav home-carousel__nav--next"
        onClick={() => scrollByCard(1)}
        aria-label="次の記事"
      >
        ›
      </button>
    </section>
  )
}
