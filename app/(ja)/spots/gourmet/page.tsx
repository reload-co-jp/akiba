import Link from "next/link"
import {
  areaSlugs,
  getGourmetSpots,
  getGourmetSpotsByArea,
  getPagedCuisines,
  getPagedGourmetAreas,
  getSpotsByCuisine,
  getCuisineLabel,
  sortGourmetSpots,
} from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import {
  getPagedScenes,
  getSpotsByScene,
  gourmetItemListLd,
} from "lib/gourmet"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import { GourmetSpotMap } from "components/gourmet-spot-map"
import AdsenseFluidAd from "components/adsense-fluid-ad"

const spotTotal = getGourmetSpots().length
const title = `秋葉原のグルメ・飲食店${spotTotal}件｜ランチ・深夜・ジャンル別`
const description = `秋葉原駅周辺の飲食店${spotTotal}件をジャンル・利用シーン・エリア別にまとめた一覧。ランチ、深夜営業、個室、ラーメン・カレー・居酒屋・メイドカフェまで、地図と営業時間つきで探せます。`

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
  const areas = getPagedGourmetAreas()

  const pageUrl = absoluteUrl("/spots/gourmet/")

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
      { "@type": "ListItem", position: 3, name: "グルメ", item: pageUrl },
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
          <h1 className="home-articles__title">秋葉原のグルメ・飲食店一覧</h1>
        </div>

        <p className="gourmet-lead">
          秋葉原エリアで食事ができる店を{spots.length}件、
          秋葉原駅から近い順に掲載しています。
          目的・ジャンル・エリアから絞り込むか、下の一覧から探してください。
        </p>

        <nav
          aria-label="目的・シーン"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            margin: "0 0 1rem",
          }}
        >
          {getPagedScenes().map((scene) => (
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

        <nav
          aria-label="ジャンル"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            margin: "0 0 2rem",
          }}
        >
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

        <nav
          aria-label="エリア"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            margin: "0 0 2rem",
          }}
        >
          {areas.map((area) => (
            <Link
              key={area}
              href={`/spots/gourmet/area/${areaSlugs[area]}/`}
              className="gourmet-cuisine-nav__link"
            >
              {area}
              <span className="gourmet-cuisine-nav__count">
                {getGourmetSpotsByArea(area).length}
              </span>
            </Link>
          ))}
        </nav>

        <GourmetSpotMap spots={spots} />

        <GourmetSpotList spots={spots} />

        <OsmAttribution />

        <AdsenseFluidAd />
      </section>
    </>
  )
}

export default Page
