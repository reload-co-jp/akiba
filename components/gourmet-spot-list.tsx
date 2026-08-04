import Link from "next/link"
import {
  distanceFromStation,
  getCuisineLabel,
  hasDetailPage,
  type Spot,
} from "lib/spots"

/**
 * Renders gourmet spots as a compact directory row rather than a card.
 *
 * Most entries here are tier B — imported in bulk, with no image and often no
 * more than a name and a location — so a card grid would be mostly empty
 * boxes. Spots that have their own page link to it; the rest are plain text.
 */
export const GourmetSpotList = ({ spots }: { spots: Spot[] }) => (
  <ul className="gourmet-list">
    {spots.map((spot) => {
      // Most bulk-imported entries have neither an address nor opening hours,
      // so distance from the station is often the only concrete thing we can
      // tell the reader about them.
      const distance = distanceFromStation(spot)
      const details = [
        distance != null ? `秋葉原駅から約${distance}m` : undefined,
        spot.address,
        spot.hours,
      ].filter(Boolean) as string[]

      const cuisines = (spot.cuisine ?? []).map(getCuisineLabel)

      return (
        <li key={spot.id} className="gourmet-list__item">
          <div className="gourmet-list__head">
            {hasDetailPage(spot) ? (
              <Link
                href={`/spots/${spot.slug}/`}
                className="gourmet-list__name gourmet-list__name--link"
              >
                {spot.name}
              </Link>
            ) : (
              <span className="gourmet-list__name">{spot.name}</span>
            )}
            {cuisines.length > 0 && (
              <span className="gourmet-list__cuisines">
                {cuisines.map((label) => (
                  <span key={label} className="gourmet-list__cuisine">
                    {label}
                  </span>
                ))}
              </span>
            )}
          </div>
          {details.length > 0 && (
            <p className="gourmet-list__meta">{details.join("／")}</p>
          )}
        </li>
      )
    })}
  </ul>
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
