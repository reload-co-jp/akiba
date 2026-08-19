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
  getSpotsByCuisine,
  hasDetailPage,
  sortGourmetSpots,
} from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import { GourmetSpotMap } from "components/gourmet-spot-map"
import AdsenseFluidAd from "components/adsense-fluid-ad"

const spotCount = sortGourmetSpots(getSpotsByCuisine("ramen")).length

const title = `秋葉原ラーメン店${spotCount}選｜家系・豚骨・鶏白湯まで`
const description = `秋葉原駅周辺のラーメン店を${spotCount}件まとめて紹介。家系・豚骨・鶏白湯・油そばなど、電気街を歩きながら寄れる店を地図と距離つきで探せます。`

export const metadata = {
  title,
  description,
  alternates: { canonical: "/spots/gourmet/ramen/" },
  openGraph: {
    title: `${title} | アキバLive`,
    description,
    url: "/spots/gourmet/ramen/",
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
  const spots = sortGourmetSpots(getSpotsByCuisine("ramen"))
  const pickSpots = spots.filter(hasDetailPage)
  const otherCuisines = getPagedCuisines().filter((c) => c !== "ramen")

  const ramenTag = getAllTags().find((t) => t.name === "ラーメン")
  const relatedArticles = ramenTag
    ? getArticlesByTagId(ramenTag.id).slice(0, 6)
    : []

  const pageUrl = absoluteUrl("/spots/gourmet/ramen/")

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
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
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
      { "@type": "ListItem", position: 4, name: "ラーメン", item: pageUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([jsonLd, breadcrumbLd]) }}
      />
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem 0" }}>
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <ol className="breadcrumb__list">
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
              ラーメン
            </li>
          </ol>
        </nav>

        <div className="ramen-lp-hero">
          <p className="home-articles__kicker">Akihabara ramen</p>
          <h1 className="ramen-lp-hero__title">秋葉原ラーメン店ガイド</h1>
          <p className="ramen-lp-hero__lead">
            秋葉原駅周辺で営業するラーメン店を{spots.length}件、駅から近い順にまとめました。
            家系・豚骨・鶏白湯・油そばなど、電気街めぐりの合間に寄れる店を地図と距離つきで探せます。
          </p>
        </div>

        {pickSpots.length > 0 && (
          <>
            <h2 className="ramen-lp-section-title">まず押さえたい注目店</h2>
            <ul className="ramen-pick-grid">
              {pickSpots.map((spot) => (
                <li key={spot.id}>
                  <Link href={`/spots/${spot.slug}/`} className="ramen-pick-card">
                    {spot.image && (
                      <img
                        src={spot.image.src}
                        alt={spot.image.alt}
                        className="ramen-pick-card__image"
                        loading="lazy"
                        width={spot.image.width}
                        height={spot.image.height}
                      />
                    )}
                    <div className="ramen-pick-card__body">
                      <h3 className="ramen-pick-card__name">{spot.name}</h3>
                      <p className="ramen-pick-card__desc">{spot.description}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="ramen-lp-section-title">地図で見る</h2>
        <GourmetSpotMap spots={spots} />

        <h2 className="ramen-lp-section-title">秋葉原のラーメン店一覧（{spots.length}件）</h2>
        <GourmetSpotList spots={spots} />

        {relatedArticles.length > 0 && (
          <>
            <h2 className="ramen-lp-section-title">ラーメン関連の新着ニュース</h2>
            <ul className="article-list">
              {relatedArticles.map((article) => (
                <li key={article.id}>
                  <Link href={`/articles/${article.slug}/`} className="article-card-link">
                    <article className="article-card">
                      <img
                        src={getArticleImage(article).src}
                        alt={getArticleImage(article).alt}
                        width={getArticleImage(article).width}
                        height={getArticleImage(article).height}
                        className="article-card__image"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="article-card__body">
                        <h3 className="article-card__title">{article.title}</h3>
                        <p className="article-card__summary">{article.summary}</p>
                        <time
                          className="article-card__date"
                          dateTime={getArticlePublishedDate(article).toISOString()}
                        >
                          {formatDate(article.publishedAt)}
                        </time>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="ramen-lp-section-title">ほかのジャンルも見る</h2>
        <nav aria-label="ほかのジャンル" className="gourmet-cuisine-nav">
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
