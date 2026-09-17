import Link from "next/link"
import { notFound } from "next/navigation"
import {
  areaSlugs,
  getAreaBySlug,
  getGourmetSpotsByArea,
  getPagedGourmetAreas,
  hasDetailPage,
  sortGourmetSpots,
} from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import { GourmetSpotMap } from "components/gourmet-spot-map"
import AdsenseFluidAd from "components/adsense-fluid-ad"

type Props = {
  params: Promise<{ area: string }>
}

export const generateStaticParams = () =>
  getPagedGourmetAreas().map((area) => ({ area: areaSlugs[area] }))

const buildTitle = (area: string) => `秋葉原${area}エリアの飲食店一覧`

const buildDescription = (area: string, count: number) =>
  `秋葉原「${area}」エリアの飲食店を${count}件掲載。住所・営業時間つきで、周辺で食事や休憩ができる店を探せます。`

export const generateMetadata = async ({ params }: Props) => {
  const { area: slug } = await params
  const area = getAreaBySlug(slug)
  if (!area) return {}

  const spots = getGourmetSpotsByArea(area)
  const title = buildTitle(area)
  const description = buildDescription(area, spots.length)

  return {
    title,
    description,
    alternates: { canonical: `/spots/gourmet/area/${slug}/` },
    openGraph: {
      title: `${title} | アキバLive`,
      description,
      url: `/spots/gourmet/area/${slug}/`,
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
  const { area: slug } = await params
  const area = getAreaBySlug(slug)
  if (!area) notFound()

  const spots = sortGourmetSpots(getGourmetSpotsByArea(area))
  const title = buildTitle(area)
  const description = buildDescription(area, spots.length)
  const pageUrl = absoluteUrl(`/spots/gourmet/area/${slug}/`)

  const otherAreas = getPagedGourmetAreas().filter((a) => a !== area)

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
      { "@type": "ListItem", position: 4, name: area, item: pageUrl },
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
              {area}
            </li>
          </ol>
        </nav>

        <div className="home-articles__header">
          <p className="home-articles__kicker">Akihabara gourmet</p>
          <h1 className="home-articles__title">{title}</h1>
        </div>

        <p className="gourmet-lead">
          秋葉原「{area}」エリアの飲食店を{spots.length}件、
          秋葉原駅から近い順に掲載しています。
        </p>

        <GourmetSpotMap spots={spots} />

        <GourmetSpotList spots={spots} />

        <nav aria-label="ほかのエリア" className="gourmet-cuisine-nav">
          {otherAreas.map((other) => (
            <Link
              key={other}
              href={`/spots/gourmet/area/${areaSlugs[other]}/`}
              className="gourmet-cuisine-nav__link"
            >
              {other}
              <span className="gourmet-cuisine-nav__count">
                {getGourmetSpotsByArea(other).length}
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
