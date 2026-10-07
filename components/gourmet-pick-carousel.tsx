"use client"

import { useRef } from "react"
import Link from "next/link"
import type { Spot } from "lib/spots"
import { GENERIC_DESCRIPTION } from "components/gourmet-spot-list"

/** Horizontal scroll-snap carousel of featured shops (all have an image). */
export const GourmetPickCarousel = ({ spots }: { spots: Spot[] }) => {
  const trackRef = useRef<HTMLUListElement>(null)

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector("li")
    const amount = card ? card.clientWidth + 16 : track.clientWidth
    track.scrollBy({ left: amount * direction, behavior: "smooth" })
  }

  if (spots.length === 0) return null

  return (
    <section className="gourmet-pick" aria-label="注目店">
      <button
        type="button"
        className="home-carousel__nav gourmet-pick__nav"
        style={{ left: "0.25rem" }}
        onClick={() => scrollByCard(-1)}
        aria-label="前の店"
      >
        ‹
      </button>
      <ul className="home-carousel__track" ref={trackRef}>
        {spots.map((spot) => (
          <li key={spot.id} className="gourmet-pick__item">
            <Link href={`/spots/${spot.slug}/`} className="gourmet-pick__card">
              <img
                src={spot.image!.src}
                alt={spot.image!.alt}
                width={spot.image!.width ?? 800}
                height={spot.image!.height ?? 600}
                loading="lazy"
                decoding="async"
              />
              <span className="gourmet-pick__body">
                <span className="gourmet-pick__name">{spot.name}</span>
                {spot.description &&
                  !GENERIC_DESCRIPTION.test(spot.description) && (
                    <span className="gourmet-pick__desc">
                      {spot.description}
                    </span>
                  )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="home-carousel__nav gourmet-pick__nav"
        style={{ right: "0.25rem" }}
        onClick={() => scrollByCard(1)}
        aria-label="次の店"
      >
        ›
      </button>
    </section>
  )
}
