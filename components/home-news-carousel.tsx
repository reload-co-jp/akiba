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
    <section
      style={{
        alignItems: "center",
        display: "flex",
        gap: "0.5rem",
        margin: "0 0 2.5rem",
        position: "relative",
      }}
      aria-label="新着記事"
    >
      <button
        type="button"
        className="home-carousel__nav"
        style={{ left: "1rem" }}
        onClick={() => scrollByCard(-1)}
        aria-label="前の記事"
      >
        ‹
      </button>
      <ul className="home-carousel__track" ref={trackRef}>
        {articles.map((article) => {
          const image = getArticleImage(article)
          return (
            <li
              key={article.id}
              style={{
                flex: "0 0 auto",
                scrollSnapAlign: "start",
                width: "min(90vw, 720px)",
              }}
            >
              <Link
                href={`/articles/${article.slug}/`}
                style={{
                  borderRadius: "10px",
                  boxShadow: "0 10px 28px rgba(68, 83, 77, 0.14)",
                  display: "block",
                  overflow: "hidden",
                  position: "relative",
                  textDecoration: "none",
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  style={{
                    aspectRatio: "16 / 9",
                    display: "block",
                    height: "auto",
                    objectFit: "cover",
                    width: "100%",
                  }}
                  loading="eager"
                  decoding="async"
                />
                <span
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0) 70%)",
                    bottom: "0",
                    color: "#fff",
                    display: "block",
                    fontSize: "min(2rem, 4vw)",
                    fontWeight: "800",
                    left: "0",
                    lineHeight: "1.4",
                    padding: "5rem 1rem 1rem",
                    position: "absolute",
                    right: "0",
                  }}
                >
                  {article.title}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        className="home-carousel__nav"
        style={{ right: "1rem" }}
        onClick={() => scrollByCard(1)}
        aria-label="次の記事"
      >
        ›
      </button>
    </section>
  )
}
