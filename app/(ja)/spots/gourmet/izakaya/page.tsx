import Link from "next/link"
import {
  getAllTags,
  getArticleImage,
  getArticlePublishedDate,
  getArticlesByTagId,
  formatDate,
} from "lib/articles"
import {
  getCuisineLabel,
  getPagedCuisines,
  getSpotImage,
  getSpotsByCuisine,
  hasDetailPage,
  sortGourmetSpots,
} from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import { GourmetSpotMap } from "components/gourmet-spot-map"
import AdsenseFluidAd from "components/adsense-fluid-ad"

const spotCount = sortGourmetSpots(getSpotsByCuisine("izakaya")).length

const title = `秋葉原居酒屋${spotCount}選｜駅近・個室・飲み放題まで`
const description = `秋葉原駅周辺の居酒屋${spotCount}件を徒歩圏内でまとめて紹介。駅近・個室あり・飲み放題・大人数OKの店まで、地図と距離つきで探せます。`

export const metadata = {
  title,
  description,
  alternates: { canonical: "/spots/gourmet/izakaya/" },
  openGraph: {
    title: `${title} | アキバLive`,
    description,
    url: "/spots/gourmet/izakaya/",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | アキバLive`,
    description,
    images: ["/images/hero.jpg"],
  },
}

const Page = () => {
  const spots = sortGourmetSpots(getSpotsByCuisine("izakaya"))
  const pickSpots = spots.filter(hasDetailPage)
  const otherCuisines = getPagedCuisines().filter((c) => c !== "izakaya")

  const izakayaTag = getAllTags().find((t) => t.name === "居酒屋")
  const relatedArticles = izakayaTag
    ? getArticlesByTagId(izakayaTag.id).slice(0, 6)
    : []

  const pageUrl = absoluteUrl("/spots/gourmet/izakaya/")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    url: pageUrl,
    numberOfItems: spots.length,
    itemListElement: spots.map((spot, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Restaurant",
        name: spot.name,
        ...(spot.image?.src ? { image: absoluteUrl(spot.image.src) } : {}),
        ...(spot.cuisine?.length ? { servesCuisine: spot.cuisine } : {}),
        ...(spot.address
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: spot.address,
                addressLocality: "千代田区",
                addressRegion: "東京都",
                addressCountry: "JP",
              },
            }
          : {}),
        ...(spot.lat && spot.lng
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: spot.lat,
                longitude: spot.lng,
              },
            }
          : {}),
        ...(hasDetailPage(spot)
          ? { url: absoluteUrl(`/spots/${spot.slug}/`) }
          : {}),
      },
    })),
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "観光スポット",
        item: absoluteUrl("/spots/"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "グルメ",
        item: absoluteUrl("/spots/gourmet/"),
      },
      { "@type": "ListItem", position: 4, name: "居酒屋", item: pageUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([jsonLd, breadcrumbLd]),
        }}
      />
      <section
        style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem 0" }}
      >
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <ol
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.25rem",
              listStyle: "none",
              padding: "0",
            }}
          >
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/spots/">観光スポット</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/spots/gourmet/">グルメ</Link>
            </li>
            <li
              className="breadcrumb__item breadcrumb__item--current"
              aria-current="page"
            >
              居酒屋
            </li>
          </ol>
        </nav>

        <div
          style={{
            borderBottom: "1px solid rgba(96, 120, 111, 0.14)",
            margin: "0 0 1.5rem",
            paddingBottom: "1.5rem",
          }}
        >
          <p className="home-articles__kicker">Akihabara izakaya</p>
          <h1
            style={{
              color: "#24312f",
              fontSize: "1.75rem",
              fontWeight: "800",
              lineHeight: "1.3",
              margin: "0.25rem 0 0.75rem",
            }}
          >
            秋葉原居酒屋ガイド
          </h1>
          <p
            style={{
              color: "#5c5148",
              fontSize: "0.9375rem",
              lineHeight: "1.7",
              margin: "0",
            }}
          >
            秋葉原駅周辺で営業する居酒屋を{spots.length}
            件、駅から近い順にまとめました。
            駅近・個室あり・飲み放題プランなど、電気街めぐりのあとに寄れる店を地図と距離つきで探せます。
          </p>
        </div>

        {pickSpots.length > 0 && (
          <>
            <h2
              style={{
                color: "#24312f",
                fontSize: "1.125rem",
                fontWeight: "700",
                margin: "2rem 0 1rem",
              }}
            >
              まず押さえたい注目店
            </h2>
            <ul
              style={{
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                listStyle: "none",
                margin: "0 0 1rem",
                padding: "0",
              }}
            >
              {pickSpots.map((spot) => (
                <li key={spot.id}>
                  <Link
                    href={`/spots/${spot.slug}/`}
                    className="ramen-pick-card"
                  >
                    <img
                      src={getSpotImage(spot).src}
                      alt={getSpotImage(spot).alt}
                      style={{
                        aspectRatio: "4 / 3",
                        display: "block",
                        height: "auto",
                        objectFit: "cover",
                        width: "100%",
                      }}
                      loading="lazy"
                      width={getSpotImage(spot).width}
                      height={getSpotImage(spot).height}
                    />
                    <div style={{ padding: "0.75rem" }}>
                      <h3
                        style={{
                          color: "#24312f",
                          fontSize: "0.9375rem",
                          fontWeight: "700",
                          margin: "0 0 0.375rem",
                        }}
                      >
                        {spot.name}
                      </h3>
                      <p
                        style={{
                          color: "#8a6f63",
                          fontSize: "0.8125rem",
                          lineHeight: "1.6",
                          margin: "0",
                          display: "-webkit-box",
                          WebkitLineClamp: "3",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {spot.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2
          style={{
            color: "#24312f",
            fontSize: "1.125rem",
            fontWeight: "700",
            margin: "2rem 0 1rem",
          }}
        >
          地図で見る
        </h2>
        <GourmetSpotMap spots={spots} />

        <h2
          style={{
            color: "#24312f",
            fontSize: "1.125rem",
            fontWeight: "700",
            margin: "2rem 0 1rem",
          }}
        >
          秋葉原の居酒屋一覧（{spots.length}件）
        </h2>
        <GourmetSpotList spots={spots} />

        {relatedArticles.length > 0 && (
          <>
            <h2
              style={{
                color: "#24312f",
                fontSize: "1.125rem",
                fontWeight: "700",
                margin: "2rem 0 1rem",
              }}
            >
              居酒屋関連の新着ニュース
            </h2>
            <ul className="article-list">
              {relatedArticles.map((article) => {
                const image = getArticleImage(article)
                return (
                  <li key={article.id}>
                    <Link
                      href={`/articles/${article.slug}/`}
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
                        <div className="article-card__body">
                          <h3 className="article-card__title">
                            {article.title}
                          </h3>
                          <p className="article-card__summary">
                            {article.summary}
                          </p>
                          <time
                            className="article-card__date"
                            dateTime={getArticlePublishedDate(
                              article
                            ).toISOString()}
                          >
                            {formatDate(article.publishedAt)}
                          </time>
                        </div>
                      </article>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        <h2
          style={{
            color: "#24312f",
            fontSize: "1.125rem",
            fontWeight: "700",
            margin: "2rem 0 1rem",
          }}
        >
          ほかのジャンルも見る
        </h2>
        <nav
          aria-label="ほかのジャンル"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            margin: "0 0 2rem",
          }}
        >
          {otherCuisines.map((other) => (
            <Link
              key={other}
              href={`/spots/gourmet/${other}/`}
              className="gourmet-cuisine-nav__link"
            >
              {getCuisineLabel(other)}
              <span className="gourmet-cuisine-nav__count">
                {getSpotsByCuisine(other).length}
              </span>
            </Link>
          ))}
        </nav>

        <OsmAttribution />

        <AdsenseFluidAd />
      </section>
    </>
  )
}

export default Page
