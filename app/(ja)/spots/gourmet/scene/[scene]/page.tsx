import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getPagedScenes,
  getSceneBySlug,
  getSpotsByScene,
  gourmetItemListLd,
} from "lib/gourmet"
import { getCuisineLabel, getPagedCuisines, hasDetailPage } from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { GourmetSpotList, OsmAttribution } from "components/gourmet-spot-list"
import { GourmetSpotMap } from "components/gourmet-spot-map"
import { GourmetPickCarousel } from "components/gourmet-pick-carousel"
import { GourmetFaq } from "components/gourmet-faq"
import { GourmetNav } from "components/gourmet-nav"
import AdsenseFluidAd from "components/adsense-fluid-ad"

type Props = {
  params: Promise<{ scene: string }>
}

export const generateStaticParams = () =>
  getPagedScenes().map((scene) => ({ scene: scene.slug }))

const h2Style = {
  color: "#24312f",
  fontSize: "1.125rem",
  fontWeight: "700",
  margin: "2rem 0 1rem",
} as const

const pStyle = {
  color: "#5c5148",
  fontSize: "0.9375rem",
  lineHeight: "1.8",
  margin: "0 0 0.75rem",
} as const

export const generateMetadata = async ({ params }: Props) => {
  const { scene: slug } = await params
  const scene = getSceneBySlug(slug)
  if (!scene) return {}

  const count = getSpotsByScene(scene).length
  const title = `${scene.title}${count}選`
  const description = scene.description(count)
  const path = `/spots/gourmet/scene/${slug}/`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | アキバLive`,
      description,
      url: path,
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
  const { scene: slug } = await params
  const scene = getSceneBySlug(slug)
  if (!scene) notFound()

  const spots = getSpotsByScene(scene)
  const pickSpots = spots.filter((s) => hasDetailPage(s) && s.image)
  const title = `${scene.title}${spots.length}選`
  const description = scene.description(spots.length)
  const pageUrl = absoluteUrl(`/spots/gourmet/scene/${slug}/`)

  // Genre breakdown: answers "秋葉原 ランチ ラーメン" style refinements and
  // links each genre page from a page that ranks for the broader query.
  const genreCounts = new Map<string, number>()
  for (const spot of spots) {
    for (const c of spot.cuisine ?? []) {
      genreCounts.set(c, (genreCounts.get(c) ?? 0) + 1)
    }
  }
  const pagedCuisines = getPagedCuisines()
  const genres = [...genreCounts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

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
      { "@type": "ListItem", position: 4, name: scene.label, item: pageUrl },
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
              {scene.label}
            </li>
          </ol>
        </nav>

        <div className="home-articles__header">
          <p className="home-articles__kicker">Akihabara gourmet</p>
          <h1 className="home-articles__title">{scene.heading}</h1>
        </div>

        {scene.lead.map((text) => (
          <p key={text} className="gourmet-lead">
            {text}
          </p>
        ))}
        <p style={{ ...pStyle, fontSize: "0.8125rem" }}>
          {scene.criteria}
          掲載{spots.length}件、秋葉原駅から近い順。
        </p>

        {pickSpots.length > 0 && (
          <>
            <h2 style={h2Style}>まず押さえたい注目店</h2>
            <GourmetPickCarousel spots={pickSpots} />
          </>
        )}

        <h2 style={h2Style}>地図で見る</h2>
        <GourmetSpotMap spots={spots} />

        {genres.length > 0 && (
          <>
            <h2 style={h2Style}>ジャンル別の内訳</h2>
            <p style={pStyle}>
              {genres.map(([c, n], i) => (
                <span key={c}>
                  {i > 0 && "、"}
                  {pagedCuisines.includes(c) ? (
                    <Link href={`/spots/gourmet/${c}/`}>
                      {getCuisineLabel(c)}
                    </Link>
                  ) : (
                    getCuisineLabel(c)
                  )}
                  {n}件
                </span>
              ))}
              。
            </p>
          </>
        )}

        <h2 style={h2Style}>
          {scene.title}一覧（{spots.length}件）
        </h2>
        <GourmetSpotList spots={spots} />

        <GourmetFaq faqs={scene.faqs(spots)} />

        <GourmetNav currentScene={scene.slug} />

        <OsmAttribution />

        <AdsenseFluidAd />
      </section>
    </>
  )
}

export default Page
