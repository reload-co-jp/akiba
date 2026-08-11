import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getPagedCuisines,
  getSpotsByCuisine,
  getCuisineLabel,
  sortGourmetSpots,
  hasDetailPage,
} from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import { GourmetSpotMap } from "components/gourmet-spot-map"
import AdsenseFluidAd from "components/adsense-fluid-ad"

type Props = {
  params: Promise<{ cuisine: string }>
}

export const generateStaticParams = () =>
  getPagedCuisines().map((cuisine) => ({ cuisine }))

const buildTitle = (cuisine: string) => `秋葉原の${getCuisineLabel(cuisine)}一覧`

const buildDescription = (cuisine: string, count: number) =>
  `秋葉原エリアの${getCuisineLabel(cuisine)}を${count}件掲載。住所・営業時間つきで、電気街周辺で食事や休憩ができる店を探せます。`

export const generateMetadata = async ({ params }: Props) => {
  const { cuisine } = await params
  if (!getPagedCuisines().includes(cuisine)) return {}

  const spots = getSpotsByCuisine(cuisine)
  const title = buildTitle(cuisine)
  const description = buildDescription(cuisine, spots.length)

  return {
    title,
    description,
    alternates: { canonical: `/spots/gourmet/${cuisine}/` },
    openGraph: {
      title: `${title} | アキバLive`,
      description,
      url: `/spots/gourmet/${cuisine}/`,
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
}

const Page = async ({ params }: Props) => {
  const { cuisine } = await params
  if (!getPagedCuisines().includes(cuisine)) notFound()

  const spots = sortGourmetSpots(getSpotsByCuisine(cuisine))
  const label = getCuisineLabel(cuisine)
  const title = buildTitle(cuisine)
  const description = buildDescription(cuisine, spots.length)
  const pageUrl = absoluteUrl(`/spots/gourmet/${cuisine}/`)

  const otherCuisines = getPagedCuisines().filter((c) => c !== cuisine)

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
      { "@type": "ListItem", position: 4, name: label, item: pageUrl },
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
              {label}
            </li>
          </ol>
        </nav>

        <div className="home-articles__header">
          <p className="home-articles__kicker">Akihabara gourmet</p>
          <h1 className="home-articles__title">{title}</h1>
        </div>

        <p className="gourmet-lead">
          秋葉原エリアの{label}を{spots.length}件、
          秋葉原駅から近い順に掲載しています。
        </p>

        <GourmetSpotMap spots={spots} />

        <GourmetSpotList spots={spots} />

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
