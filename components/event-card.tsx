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
  title: string
  venue: string
  dateRange: string
  price?: string
  tags?: string[]
  sourceUrl?: string
  sourceLabel?: string
  headingAs?: "h2" | "h3"
  labels?: { venue?: string; dates?: string; price?: string }
}

export const EventCard = ({
  href,
  image,
  title,
  venue,
  dateRange,
  price,
  tags,
  sourceUrl,
  sourceLabel,
  headingAs = "h3",
  labels = {},
}: Props) => {
  const img = image ?? PLACEHOLDER
  const Heading = headingAs as "h2" | "h3"
  const l = { venue: "会場", dates: "期間", price: "料金", ...labels }
  return (
    <li>
      <Link href={href} className="events-card-link">
        <article className="events-card events-card--with-image">
          <img
            className="events-card__image"
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            loading="lazy"
            decoding="async"
          />
          <div>
            {tags && tags.length > 0 && (
              <div className="events-card__tags">
                {tags.map((tag) => (
                  <span key={tag} className="events-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <Heading className="events-card__title">{title}</Heading>
            <dl className="events-card__meta">
              <dt>{l.venue}</dt>
              <dd>{venue}</dd>
              <dt>{l.dates}</dt>
              <dd>{dateRange}</dd>
              {price && (
                <>
                  <dt>{l.price}</dt>
                  <dd>{price}</dd>
                </>
              )}
            </dl>
          </div>
        </article>
      </Link>
      {sourceUrl && (
        <a
          href={sourceUrl}
          className="today-official-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          ↗ {sourceLabel}
        </a>
      )}
    </li>
  )
}
