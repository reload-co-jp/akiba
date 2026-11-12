import Link from "next/link"
import { getPagedScenes, getSpotsByScene } from "lib/gourmet"
import { getCuisineLabel, getPagedCuisines, getSpotsByCuisine } from "lib/spots"

const headingStyle = {
  color: "#24312f",
  fontSize: "1.125rem",
  fontWeight: "700",
  margin: "2rem 0 1rem",
} as const

const navStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  margin: "0 0 1.5rem",
} as const

/**
 * Chips linking every scene page and genre page. Shared by all gourmet index
 * pages so each one links to the rest — search engines discover the long-tail
 * pages through these, and visitors switch between "ランチ" and "ラーメン"
 * without going back to the top.
 */
export const GourmetNav = ({
  currentScene,
  currentCuisine,
}: {
  currentScene?: string
  currentCuisine?: string
}) => {
  const scenes = getPagedScenes().filter((s) => s.slug !== currentScene)
  const cuisines = getPagedCuisines().filter((c) => c !== currentCuisine)

  return (
    <>
      {scenes.length > 0 && (
        <>
          <h2 style={headingStyle}>目的・シーンから探す</h2>
          <nav aria-label="目的・シーン" style={navStyle}>
            {scenes.map((scene) => (
              <Link
                key={scene.slug}
                href={`/spots/gourmet/scene/${scene.slug}/`}
                className="gourmet-cuisine-nav__link"
              >
                {scene.label}
                <span className="gourmet-cuisine-nav__count">
                  {getSpotsByScene(scene).length}
                </span>
              </Link>
            ))}
          </nav>
        </>
      )}
      <h2 style={headingStyle}>ジャンルから探す</h2>
      <nav aria-label="ジャンル" style={navStyle}>
        {cuisines.map((cuisine) => (
          <Link
            key={cuisine}
            href={`/spots/gourmet/${cuisine}/`}
            className="gourmet-cuisine-nav__link"
          >
            {getCuisineLabel(cuisine)}
            <span className="gourmet-cuisine-nav__count">
              {getSpotsByCuisine(cuisine).length}
            </span>
          </Link>
        ))}
      </nav>
    </>
  )
}
