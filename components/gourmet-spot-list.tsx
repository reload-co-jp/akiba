import Link from "next/link"
import {
  distanceFromStation,
  getCuisineLabel,
  hasDetailPage,
  spotAreas,
  type Spot,
} from "lib/spots"

/**
 * Renders gourmet spots as a magazine-style feature list: numbered entries
 * with a kicker, a serif shop name and a short spec sheet.
 *
 * Most entries are tier B — bulk imports with no image and only a generic
 * description — so imageless shops get a shared placeholder (decorative, empty
 * alt) and boilerplate descriptions are dropped rather than repeated.
 */
const PLACEHOLDER_IMAGE = {
  src: "/images/gourmet-placeholder.jpeg",
  alt: "",
  width: 1365,
  height: 768,
}
export const GENERIC_DESCRIPTION = /^秋葉原エリアの\S+$/
const HIDDEN_TAGS = new Set<string>([...spotAreas, "グルメ"])
const MAX_TAGS = 4

export const GourmetSpotList = ({ spots }: { spots: Spot[] }) => (
  <ol className="gourmet-feature">
    {spots.map((spot, i) => {
      const distance = distanceFromStation(spot)
      const cuisines = (spot.cuisine ?? []).map(getCuisineLabel)
      const kicker = [
        cuisines.join("・"),
        distance != null ? `駅から約${distance}m` : undefined,
      ].filter(Boolean)
      const description =
        spot.description && !GENERIC_DESCRIPTION.test(spot.description)
          ? spot.description
          : undefined
      const meta = [
        ["住所", spot.address],
        ["営業時間", spot.hours],
        ["定休日", spot.closed],
      ].filter(([, value]) => value) as [string, string][]
      const tags = (spot.tags ?? [])
        .filter((t) => !HIDDEN_TAGS.has(t) && !cuisines.includes(t))
        .slice(0, MAX_TAGS)
      const href = hasDetailPage(spot) ? `/spots/${spot.slug}/` : undefined
      const image = spot.image ?? PLACEHOLDER_IMAGE

      return (
        <li key={spot.id} className="gourmet-feature__item">
          <figure className="gourmet-feature__media">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              width={image.width ?? 800}
              height={image.height ?? 600}
            />
          </figure>
          <div className="gourmet-feature__body">
            <p className="gourmet-feature__kicker">
              <span className="gourmet-feature__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              {kicker.join(" ／ ")}
            </p>
            <h3 className="gourmet-feature__name">
              {href ? <Link href={href}>{spot.name}</Link> : spot.name}
            </h3>
            {description && (
              <p className="gourmet-feature__desc">{description}</p>
            )}
            {spot.editorComment && (
              <blockquote className="gourmet-feature__comment">
                {spot.editorComment.text}
              </blockquote>
            )}
            {meta.length > 0 && (
              <dl className="gourmet-feature__meta">
                {meta.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {tags.length > 0 && (
              <ul className="gourmet-feature__tags">
                {tags.map((t) => (
                  <li key={t}>#{t}</li>
                ))}
              </ul>
            )}
            {href && (
              <Link href={href} className="gourmet-feature__more">
                店舗の詳細を見る →
              </Link>
            )}
          </div>
        </li>
      )
    })}
  </ol>
)

/**
 * OpenStreetMap is ODbL-licensed: anywhere we publish data derived from it we
 * have to say so. Every gourmet index page renders this.
 */
export const OsmAttribution = () => (
  <p className="gourmet-attribution">
    駅からの距離はJR秋葉原駅電気街口からの直線距離で、実際の歩行距離とは
    異なります。番地のない住所は位置情報から求めた町丁目までの表示です。
    店舗の一部は{" "}
    <a
      href="https://www.openstreetmap.org/copyright"
      rel="noopener noreferrer"
      target="_blank"
    >
      OpenStreetMap contributors
    </a>{" "}
    のデータ（ODbL 1.0）をもとに掲載しています。営業時間や住所は変更されている
    場合があります。来店前に店頭・公式情報をご確認ください。
  </p>
)
