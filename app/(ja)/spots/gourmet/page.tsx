import Link from "next/link"
import {
  getGourmetSpots,
  getPagedCuisines,
  getSpotsByCuisine,
  getCuisineLabel,
  sortGourmetSpots,
  hasDetailPage,
} from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import AdsenseFluidAd from "components/adsense-fluid-ad"

const title = "秋葉原のグルメ・飲食店一覧"
const description =
  "秋葉原エリアの飲食店をジャンル別にまとめた一覧。ラーメン・カレー・カフェ・居酒屋・メイドカフェなど、電気街周辺で食事ができる店を探せます。"

export const metadata = {
  title,
  description,
  alternates: { canonical: "/spots/gourmet/" },
  openGraph: {
    title: `${title} | アキバLive`,
    description,
    url: "/spots/gourmet/",
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
  const spots = sortGourmetSpots(getGourmetSpots())
  const cuisines = getPagedCuisines()

  const pageUrl = absoluteUrl("/spots/gourmet/")

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
      { "@type": "ListItem", position: 3, name: "グルメ", item: pageUrl },
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
            <li
              className="breadcrumb__item breadcrumb__item--current"
              aria-current="page"
            >
              グルメ
            </li>
          </ol>
        </nav>

        <div className="home-articles__header">
          <p className="home-articles__kicker">Akihabara gourmet</p>
          <h1 className="home-articles__title">{title}</h1>
        </div>

        <p className="gourmet-lead">
          秋葉原エリアで食事ができる店を{spots.length}件掲載しています。
          ジャンルから絞り込むか、下の一覧から探してください。
        </p>

        <nav aria-label="ジャンル" className="gourmet-cuisine-nav">
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

        <AdsenseFluidAd />

        <GourmetSpotList spots={spots} />

        <OsmAttribution />
      </section>
    </>
  )
}

export default Page
