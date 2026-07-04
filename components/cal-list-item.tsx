import Link from "next/link"

const PLACEHOLDER = {
  src: "/images/placeholder.jpg",
  alt: "アキバLiveの記事サムネイル",
  width: 1024,
  height: 683,
}

type Props = {
  href: string
  image?: { src: string; alt: string; width?: number; height?: number }
  dateTime: string
  dateLabel: string
  title: string
  venue: string
}

export const CalListItem = ({ href, image, dateTime, dateLabel, title, venue }: Props) => {
  const img = image ?? PLACEHOLDER
  return (
    <li>
      <Link href={href} className="cal__list-item">
        <img
          className="cal__list-image"
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading="lazy"
          decoding="async"
        />
        <time className="cal__list-date" dateTime={dateTime}>
          {dateLabel}
        </time>
        <span className="cal__list-title">{title}</span>
        <span className="cal__list-venue">{venue}</span>
      </Link>
    </li>
  )
}
