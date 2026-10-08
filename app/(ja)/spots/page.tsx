import Link from "next/link"
import { Fragment } from "react"
import AdsenseDisplayAd from "components/adsense-display-ad"
import {
  getDetailPageSpots,
  sortGourmetSpots,
  getAllSpotCategories,
  getSpotImage,
  getPagedAreas,
  getSpotsByArea,
  areaSlugs,
} from "lib/spots"
import type { Spot, SpotCategory } from "lib/spots"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { getTagColorClass } from "lib/articles"

const categoryGuide: {
  category: SpotCategory
  id: string
  heading: string
  lead: string
}[] = [
  {
    category: "アニメ・マンガ・同人",
    id: "anime",
    heading: "アニメ・マンガ・同人ショップ",
    lead: "秋葉原観光の定番。大型アニメショップや同人誌専門店が中央通り周辺に集まり、新刊・限定グッズ探しやコラボ企画めぐりが楽しめます。",
  },
  {
    category: "ゲーム・フィギュア",
    id: "game",
    heading: "ゲーム・フィギュア・ホビー",
    lead: "レトロゲームから最新タイトル、プライズフィギュアまで。ゲームセンターや中古ショップをはしごするのがアキバ流です。",
  },
  {
    category: "フィギュア・模型",
    id: "hobby",
    heading: "フィギュア・模型専門店",
    lead: "プラモデルやスケールフィギュアの専門店。限定品や海外では手に入りにくいアイテムを探す観光客にも人気です。",
  },
  {
    category: "電気街・PCパーツ",
    id: "electronics",
    heading: "電気街・PCパーツ",
    lead: "「電気街」と呼ばれる秋葉原の原点。家電量販店から電子部品の老舗まで、ものづくり好きにはたまらないエリアです。",
  },
  {
    category: "イベント・ライブ",
    id: "event",
    heading: "イベント・ライブ会場",
    lead: "アイドルライブやトークショー、ポップアップが開催される会場。訪問前にイベントスケジュールをチェックしておくのがおすすめです。",
  },
  {
    category: "ショッピング",
    id: "shopping",
    heading: "ショッピング・商業施設",
    lead: "駅前の大型商業施設や高架下のショップなど、雨の日でも楽しめる買い物スポットをまとめました。",
  },
]

const GOURMET_PREVIEW = 6

const faqs = [
  {
    q: "秋葉原観光の所要時間はどれくらい？",
    a: "主要なアニメショップや電気街を一通りめぐるなら半日（3〜4時間）が目安です。ショップのはしごやグルメ、コラボカフェまで楽しむなら1日あると余裕をもって回れます。",
  },
  {
    q: "秋葉原へのアクセス方法は？",
    a: "JR山手線・京浜東北線・総武線、東京メトロ日比谷線、つくばエクスプレスの秋葉原駅が最寄りです。東京メトロ銀座線の末広町駅、JR・東京メトロの御徒町駅からも徒歩圏内です。",
  },
  {
    q: "秋葉原観光におすすめの時間帯は？",
    a: "多くのショップは10〜11時ごろに開店します。日曜・祝日の午後は中央通りが歩行者天国になり、街歩きがしやすくなります。",
  },
  {
    q: "雨の日でも秋葉原観光は楽しめる？",
    a: "駅直結の大型店や商業施設、ビル内のアニメショップが多いため、雨の日でも楽しめます。ショッピングカテゴリのスポットを中心に回るのがおすすめです。",
  },
]

const visibleGuides = categoryGuide.filter((g) =>
  getAllSpotCategories().includes(g.category)
)
const GOURMET: SpotCategory = "グルメ・カフェ"
const sightseeingSpots = getDetailPageSpots().filter(
  (s) => s.category !== GOURMET
)
const spotCount = sightseeingSpots.length
const title = `秋葉原観光スポットおすすめ${spotCount}選｜定番から穴場まで`
const description = `秋葉原観光で行きたいスポット${spotCount}件をアニメ・ゲーム・電気街など${visibleGuides.length}ジャンル別に紹介。観光の合間に寄りたいグルメ情報も。アクセスや所要時間、楽しみ方のコツもまとめた秋葉原観光ガイドです。`

export const metadata = {
  title,
  description,
  keywords: [
    "秋葉原",
    "アキバ",
    "秋葉原 観光",
    "秋葉原 観光スポット",
    "秋葉原 おすすめ",
    "秋葉原 観光 モデルコース",
    "秋葉原 電気街",
    "秋葉原 アニメ",
    "秋葉原 ゲーム",
    "秋葉原 グルメ",
    "秋葉原 ショッピング",
    "神田",
    "末広町",
  ],
  alternates: { canonical: "/spots/" },
  openGraph: {
    title: `${title} | アキバLive`,
    description,
    url: "/spots/",
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

const SpotCard = ({ spot }: { spot: Spot }) => {
  const image = getSpotImage(spot)
  return (
    <li>
      <Link href={`/spots/${spot.slug}/`} className="spots-card">
        <figure className="spots-card__media">
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="spots-card__body">
          {spot.tags && spot.tags.length > 0 && (
            <div className="article-card__tags">
              {spot.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`article-card__tag ${getTagColorClass(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h3 className="spots-card__name">{spot.name}</h3>
          {spot.access && <p className="spots-card__access">{spot.access}</p>}
        </div>
      </Link>
    </li>
  )
}

const Page = () => {
  const spots = sightseeingSpots
  const areas = getPagedAreas()
  const sections = visibleGuides
    .map((g) => {
      const shown = spots.filter((s) => s.category === g.category)
      return { ...g, total: shown.length, shown }
    })
    .filter((s) => s.total > 0)
  const gourmetSpots = getDetailPageSpots().filter(
    (s) => s.category === GOURMET
  )
  const gourmetPreview = sortGourmetSpots(
    gourmetSpots.filter((s) => s.image)
  ).slice(0, GOURMET_PREVIEW)

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
    ],
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([jsonLd, breadcrumbLd, faqLd]),
        }}
      />
      <section className="spots-guide">
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
            <li
              className="breadcrumb__item breadcrumb__item--current"
              aria-current="page"
            >
              観光スポット
            </li>
          </ol>
        </nav>

        <header className="spots-hero">
          <img
            src="/images/hero.jpg"
            alt="秋葉原の街並み"
            width={1200}
            height={630}
            className="spots-hero__image"
            fetchPriority="high"
          />
          <div className="spots-hero__body">
            <p className="spots-hero__kicker">Akihabara Sightseeing Guide</p>
            <h1 className="spots-hero__title">
              秋葉原観光スポット
              <br />
              おすすめ{spotCount}選
            </h1>
            <p className="spots-hero__lead">
              アニメ・ゲーム・電気街・グルメまで。はじめての秋葉原観光でも迷わない、ジャンル別のスポットガイド。
            </p>
          </div>
        </header>

        <nav aria-label="ジャンル別" className="spots-jump">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="spots-jump__item">
              <span className="spots-jump__label">{s.heading}</span>
              <span className="spots-jump__count">{s.total}件</span>
            </a>
          ))}
          {gourmetSpots.length > 0 && (
            <a
              href="#gourmet"
              className="spots-jump__item spots-jump__item--gourmet"
            >
              <span className="spots-jump__label">グルメ・カフェ</span>
              <span className="spots-jump__count">{gourmetSpots.length}件</span>
            </a>
          )}
        </nav>

        <section className="spots-intro" aria-labelledby="spots-intro-title">
          <h2 id="spots-intro-title" className="spots-section__title">
            秋葉原観光の楽しみ方
          </h2>
          <p>
            秋葉原は、世界有数の電気街として発展し、いまではアニメ・マンガ・ゲームなどのポップカルチャーの聖地として国内外から観光客が訪れる街です。JR秋葉原駅の電気街口を出て中央通りを歩けば、大型アニメショップやゲームセンター、フィギュア専門店が立ち並びます。末広町・神田・御徒町方面まで足をのばすと、老舗の専門店や名物グルメにも出会えます。
          </p>
          <nav aria-label="エリア別一覧" className="spots-areas">
            {areas.map((area) => (
              <Link
                key={area}
                href={`/spots/area/${areaSlugs[area]}/`}
                className="gourmet-cuisine-nav__link"
              >
                {area}
                <span className="gourmet-cuisine-nav__count">
                  {getSpotsByArea(area).length}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <AdsenseDisplayAd />

        {sections.map((s, i) => (
          <Fragment key={s.id}>
            {i === 3 && <AdsenseDisplayAd />}
            <section
              id={s.id}
              className="spots-section"
              aria-labelledby={`${s.id}-title`}
            >
              <div className="spots-section__head">
                <h2 id={`${s.id}-title`} className="spots-section__title">
                  秋葉原の{s.heading}
                </h2>
                <span className="spots-section__count">{s.total}件</span>
              </div>
              <p className="spots-section__lead">{s.lead}</p>
              <ul className="spots-grid">
                {s.shown.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </ul>
            </section>
          </Fragment>
        ))}

        {gourmetSpots.length > 0 && (
          <section
            id="gourmet"
            className="spots-gourmet"
            aria-labelledby="gourmet-title"
          >
            <p className="spots-gourmet__kicker">Gourmet</p>
            <h2 id="gourmet-title" className="spots-gourmet__title">
              観光の合間に寄りたい秋葉原グルメ
            </h2>
            <p className="spots-gourmet__lead">
              ラーメン・カレー・居酒屋・コラボカフェなど、秋葉原の飲食店
              {gourmetSpots.length}
              件は別ページで紹介しています。ここでは駅から近い人気店をピックアップ。
            </p>
            <ul className="spots-grid">
              {gourmetPreview.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </ul>
            <p className="spots-section__more">
              <Link href="/spots/gourmet/" className="home-articles__more">
                秋葉原のグルメ{gourmetSpots.length}件をすべて見る
              </Link>
            </p>
          </section>
        )}

        <section className="spots-faq" aria-labelledby="spots-faq-title">
          <h2 id="spots-faq-title" className="spots-section__title">
            秋葉原観光のよくある質問
          </h2>
          {faqs.map((f) => (
            <details key={f.q} className="spots-faq__item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </section>
    </>
  )
}

export default Page
