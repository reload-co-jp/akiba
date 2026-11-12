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
import { gourmetItemListLd } from "lib/gourmet"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import { GourmetSpotMap } from "components/gourmet-spot-map"
import { GourmetGuide, isLateNight } from "components/gourmet-guide"
import { GourmetPickCarousel } from "components/gourmet-pick-carousel"
import { GourmetNav } from "components/gourmet-nav"
import {
  cuisineIntros,
  genericAreaNotes,
  genericIntro,
  genericStyles,
} from "lib/gourmet-guides"
import AdsenseFluidAd from "components/adsense-fluid-ad"

type Props = {
  params: Promise<{ cuisine: string }>
}

// "ramen" and "izakaya" have their own hand-built LPs at /spots/gourmet/ramen/
// and /spots/gourmet/izakaya/ instead of this generic template — excluded
// here so the routes don't collide.
const HAND_BUILT_CUISINES = ["ramen", "izakaya"]

export const generateStaticParams = () =>
  getPagedCuisines()
    .filter((cuisine) => !HAND_BUILT_CUISINES.includes(cuisine))
    .map((cuisine) => ({ cuisine }))

// "◯件選" + the facets people refine by: matches how genre queries
// ("秋葉原 焼肉") are phrased and gives the snippet a concrete number.
const buildTitle = (cuisine: string, count: number) =>
  `秋葉原の${getCuisineLabel(cuisine)}${count}選｜駅近・営業時間・地図`

const buildHeading = (cuisine: string) =>
  `秋葉原の${getCuisineLabel(cuisine)}ガイド`

const buildDescription = (cuisine: string) => {
  const spots = getSpotsByCuisine(cuisine)
  const late = spots.filter((s) => isLateNight(s.hours)).length
  return `秋葉原駅周辺の${getCuisineLabel(cuisine)}${spots.length}件を駅から近い順に紹介。${
    late > 0 ? `23時以降も営業する店${late}件を含め、` : ""
  }住所・営業時間・地図つきで、電気街口・昭和通り口それぞれの店を探せます。`
}

export const generateMetadata = async ({ params }: Props) => {
  const { cuisine } = await params
  if (!getPagedCuisines().includes(cuisine)) return {}

  const spots = getSpotsByCuisine(cuisine)
  const title = buildTitle(cuisine, spots.length)
  const description = buildDescription(cuisine)

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

const h2Style = {
  color: "#24312f",
  fontSize: "1.125rem",
  fontWeight: "700",
  margin: "2rem 0 1rem",
} as const

const Page = async ({ params }: Props) => {
  const { cuisine } = await params
  if (!getPagedCuisines().includes(cuisine)) notFound()

  const spots = sortGourmetSpots(getSpotsByCuisine(cuisine))
  const label = getCuisineLabel(cuisine)
  const title = buildTitle(cuisine, spots.length)
  const description = buildDescription(cuisine)
  const pickSpots = spots.filter((s) => hasDetailPage(s) && s.image)
  const pageUrl = absoluteUrl(`/spots/gourmet/${cuisine}/`)

  const jsonLd = gourmetItemListLd({
    name: title,
    description,
    url: pageUrl,
    spots,
  })

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
      { "@type": "ListItem", position: 4, name: label, item: pageUrl },
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
              {label}
            </li>
          </ol>
        </nav>

        <div className="home-articles__header">
          <p className="home-articles__kicker">Akihabara gourmet</p>
          <h1 className="home-articles__title">{buildHeading(cuisine)}</h1>
        </div>

        <p className="gourmet-lead">
          秋葉原エリアの{label}を{spots.length}件、
          秋葉原駅から近い順に掲載しています。
        </p>

        {pickSpots.length > 0 && (
          <>
            <h2 style={h2Style}>まず押さえたい注目店</h2>
            <GourmetPickCarousel spots={pickSpots} />
          </>
        )}

        <h2 style={h2Style}>地図で見る</h2>
        <GourmetSpotMap spots={spots} />

        <h2 style={h2Style}>
          秋葉原の{label}一覧（{spots.length}件）
        </h2>
        <GourmetSpotList spots={spots} />

        <GourmetGuide
          label={label}
          spots={spots}
          intro={cuisineIntros[cuisine] ?? genericIntro(label)}
          areaNotes={genericAreaNotes}
          styles={genericStyles}
        />

        <GourmetNav currentCuisine={cuisine} />

        <OsmAttribution />

        <AdsenseFluidAd />
      </section>
    </>
  )
}

export default Page
