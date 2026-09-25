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
  <ul
    style={{
      borderTop: "1px solid rgba(96, 120, 111, 0.14)",
      listStyle: "none",
      margin: "0 0 2rem",
      padding: "0",
    }}
  >
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
        <li
          key={spot.id}
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.14)",
            display: "flex",
            gap: "0.75rem",
            padding: "0.75rem 0.25rem",
          }}
        >
          {spot.image && (
            <img
              src={spot.image.src}
              alt={spot.image.alt}
              style={{
                borderRadius: "6px",
                flexShrink: "0",
                height: "64px",
                objectFit: "cover",
                width: "64px",
              }}
              loading="lazy"
              width={96}
              height={96}
            />
          )}
          <div style={{ flex: "1", minWidth: "0" }}>
            <div
              style={{
                alignItems: "baseline",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
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
                <span
                  style={{
                    display: "inline-flex",
                    flexWrap: "wrap",
                    gap: "0.25rem",
                  }}
                >
                  {cuisines.map((label) => (
                    <span
                      key={label}
                      style={{
                        background: "rgba(185, 74, 58, 0.08)",
                        borderRadius: "4px",
                        color: "#8a6f63",
                        fontSize: "0.6875rem",
                        padding: "0.125rem 0.375rem",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </span>
              )}
            </div>
            {details.length > 0 && (
              <p
                style={{
                  color: "#8a6f63",
                  fontSize: "0.75rem",
                  lineHeight: "1.6",
                  margin: "0.25rem 0 0",
                }}
              >
                {details.join("／")}
              </p>
            )}
          </div>
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
