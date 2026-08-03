import Link from "next/link"
import { getDetailPageSpots, getAllSpotCategories, getSpotImage } from "lib/spots"
import type { SpotCategory } from "lib/spots"
import { absoluteUrl } from "lib/site"

export const metadata = {
  title: "観光スポット",
  description:
    "秋葉原の観光スポット一覧。電気街・アニメ・ゲーム・グルメなどカテゴリ別に紹介します。",
  alternates: { canonical: "/spots/" },
  openGraph: {
    title: "観光スポット | アキバLive",
    description:
      "秋葉原の観光スポット一覧。電気街・アニメ・ゲーム・グルメなどカテゴリ別に紹介します。",
    url: "/spots/",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "観光スポット | アキバLive",
    description: "秋葉原の観光スポット一覧。電気街・アニメ・ゲーム・グルメなどカテゴリ別に紹介します。",
    images: ["/images/hero.jpg"],
  },
}

const categoryOrder: SpotCategory[] = [
  "電気街・PCパーツ",
  "アニメ・マンガ・同人",
  "ゲーム・フィギュア",
  "フィギュア・模型",
  "グルメ・カフェ",
  "ショッピング",
]

const Page = () => {
  const spots = getDetailPageSpots()
  const categories = categoryOrder.filter((c) =>
    getAllSpotCategories().includes(c)
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "秋葉原 観光スポット一覧",
    url: absoluteUrl("/spots/"),
    numberOfItems: spots.length,
    itemListElement: spots.map((spot, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: spot.name,
      url: absoluteUrl(`/spots/${spot.slug}/`),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem 0" }}
      >
        <div className="home-articles__header">
          <p className="home-articles__kicker">Spot guide</p>
          <h1 className="home-articles__title">観光スポット</h1>
        </div>

        {categories.map((category) => {
          const categorySpots = spots.filter((s) => s.category === category)
          if (categorySpots.length === 0) return null
          return (
            <section key={category} style={{ marginBottom: "2.5rem" }}>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  color: "#b94a3a",
                  borderBottom: "2px solid #b94a3a",
                  paddingBottom: ".25rem",
                  marginBottom: "1rem",
                }}
              >
                {category}
              </h2>
              <ul
                className="article-list"
                style={{ listStyle: "none", padding: 0, margin: 0 }}
              >
                {categorySpots.map((spot) => {
                  const image = getSpotImage(spot)
                  return (
                    <li key={spot.id}>
                      <Link
                        href={`/spots/${spot.slug}/`}
                        className="article-card-link"
                      >
                        <article className="article-card">
                          <img
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            className="article-card__image"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="article-card__tags">
                            {spot.tags?.map((tag) => (
                              <span key={tag} className="article-card__tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="article-card__title">{spot.name}</h3>
                          <p
                            style={{
                              fontSize: ".75rem",
                              color: "#8a6f63",
                              margin: ".25rem 0 0",
                              lineHeight: "1.5",
                              padding: "0 1rem 1rem",
                            }}
                          >
                            {spot.access}
                          </p>
                        </article>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </section>
    </>
  )
}

export default Page
