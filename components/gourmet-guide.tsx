import Link from "next/link"
import { jsonLdScript } from "lib/json-ld"
import {
  distanceFromStation,
  hasDetailPage,
  spotAreas,
  type Spot,
  type SpotArea,
} from "lib/spots"

export type GourmetGuideStyle = {
  /** Matched against spot.tags and spot.cuisine. */
  keys: string[]
  label: string
  text: string
}

type Props = {
  /** e.g. "ラーメン店" */
  label: string
  spots: Spot[]
  intro: string[]
  areaNotes: Partial<Record<SpotArea, string>>
  styles: GourmetGuideStyle[]
}

const NEAR_METRES = 300
const NAMES_PER_SECTION = 6

const h2Style = {
  color: "#24312f",
  fontSize: "1.125rem",
  fontWeight: "700",
  margin: "2rem 0 1rem",
} as const

const h3Style = {
  color: "#24312f",
  fontSize: "1rem",
  fontWeight: "700",
  margin: "1.25rem 0 0.375rem",
} as const

const pStyle = {
  color: "#5c5148",
  fontSize: "0.9375rem",
  lineHeight: "1.8",
  margin: "0 0 0.75rem",
} as const

/** Closes at 23:00 or later (incl. past midnight / 24h). */
export const isLateNight = (hours?: string): boolean => {
  if (!hours) return false
  if (/24時間|翌/.test(hours)) return true
  return [...hours.matchAll(/[〜~～-]\s*(\d{1,2}):\d{2}/g)].some(([, h]) => {
    const hour = Number(h)
    return hour >= 23 || hour <= 5
  })
}

const SpotNames = ({ spots }: { spots: Spot[] }) => {
  const shown = spots.slice(0, NAMES_PER_SECTION)
  const rest = spots.length - shown.length
  return (
    <p style={{ ...pStyle, fontSize: "0.875rem" }}>
      主な店：
      {shown.map((spot, i) => (
        <span key={spot.id}>
          {i > 0 && "、"}
          {hasDetailPage(spot) ? (
            <Link href={`/spots/${spot.slug}/`}>{spot.name}</Link>
          ) : (
            spot.name
          )}
        </span>
      ))}
      {rest > 0 && ` ほか${rest}件`}
    </p>
  )
}

export const GourmetGuide = ({
  label,
  spots,
  intro,
  areaNotes,
  styles,
}: Props) => {
  const near = spots
    .filter((s) => {
      const d = distanceFromStation(s)
      return d != null && d <= NEAR_METRES
    })
    .sort((a, b) => distanceFromStation(a)! - distanceFromStation(b)!)
  const late = spots.filter((s) => isLateNight(s.hours))
  const areas = spotAreas
    .map((area) => ({
      area,
      spots: spots.filter((s) => s.tags?.includes(area)),
    }))
    .filter((a) => a.spots.length > 0)
    .sort((a, b) => b.spots.length - a.spots.length)
  const styleGroups = styles
    .map((style) => ({
      ...style,
      spots: spots.filter((s) =>
        style.keys.some((k) => s.tags?.includes(k) || s.cuisine?.includes(k))
      ),
    }))
    .filter((g) => g.spots.length > 0)

  const topArea = areas[0]
  const faqs = [
    {
      q: `秋葉原に${label}は何件ありますか？`,
      a: `アキバLiveでは秋葉原駅周辺の${label}を${spots.length}件掲載しています。${
        topArea
          ? `最も多いのは${topArea.area}エリアで${topArea.spots.length}件です。`
          : ""
      }`,
    },
    {
      q: `秋葉原駅から近い${label}は？`,
      a: near.length
        ? `秋葉原駅から直線${NEAR_METRES}m以内には${near.length}件あります。${near
            .slice(0, 3)
            .map((s) => s.name)
            .join("、")}などが駅からすぐの距離です。`
        : `駅から直線${NEAR_METRES}m以内の掲載店は現在ありません。一覧は駅から近い順に並べています。`,
    },
    {
      q: `秋葉原で夜遅くまで営業している${label}は？`,
      a: late.length
        ? `営業時間を確認できた店のうち、23時以降まで営業しているのは${late.length}件です。${late
            .slice(0, 3)
            .map((s) => s.name)
            .join(
              "、"
            )}などがあります。営業時間は変更される場合があるため、来店前に公式情報をご確認ください。`
        : `23時以降まで営業している掲載店は確認できていません。営業時間は来店前に公式情報をご確認ください。`,
    },
  ]

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
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqLd) }}
      />

      <h2 style={h2Style}>秋葉原の{label}の特徴</h2>
      {intro.map((text) => (
        <p key={text} style={pStyle}>
          {text}
        </p>
      ))}
      <p style={pStyle}>
        掲載{spots.length}件のうち、秋葉原駅から直線{NEAR_METRES}m以内は
        {near.length}件、23時以降まで営業している店は{late.length}
        件（営業時間を確認できた店のみ）。
      </p>

      {areas.length > 0 && (
        <>
          <h2 style={h2Style}>エリア別の傾向</h2>
          {areas.map(({ area, spots: areaSpots }) => (
            <section key={area}>
              <h3 style={h3Style}>
                {area}エリア（{areaSpots.length}件）
              </h3>
              {areaNotes[area] && <p style={pStyle}>{areaNotes[area]}</p>}
              <SpotNames spots={areaSpots} />
            </section>
          ))}
        </>
      )}

      {styleGroups.length > 0 && (
        <>
          <h2 style={h2Style}>ジャンル・目的別の選び方</h2>
          {styleGroups.map((g) => (
            <section key={g.label}>
              <h3 style={h3Style}>
                {g.label}（{g.spots.length}件）
              </h3>
              <p style={pStyle}>{g.text}</p>
              <SpotNames spots={g.spots} />
            </section>
          ))}
        </>
      )}

      <h2 style={h2Style}>よくある質問</h2>
      <dl style={{ margin: "0 0 1rem" }}>
        {faqs.map((f) => (
          <div key={f.q}>
            <dt style={h3Style}>Q. {f.q}</dt>
            <dd style={{ ...pStyle, marginLeft: "0" }}>A. {f.a}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}
