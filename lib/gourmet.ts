import { absoluteUrl } from "./site"
import {
  getCuisineLabel,
  getGourmetSpots,
  hasDetailPage,
  sortGourmetSpots,
  type Spot,
} from "./spots"

/**
 * Time ranges ("11:00〜14:00", "17:00〜翌1:00", "Mo-Fr 07:00-22:00") pulled
 * out of a free-text `hours` string, in minutes from midnight. A range that
 * ends past midnight gets 24h added to its end so "closes after midnight" is
 * simply `end >= 1440`.
 */
export const parseHourRanges = (hours?: string): [number, number][] => {
  if (!hours) return []
  const re =
    /(\d{1,2})[:：](\d{2})\s*[〜~～\-–]\s*(翌)?\s*(\d{1,2})[:：](\d{2})/g
  return [...hours.matchAll(re)].map(([, sh, sm, next, eh, em]) => {
    const start = Number(sh) * 60 + Number(sm)
    let end = Number(eh) * 60 + Number(em)
    if (next || end <= start) end += 24 * 60
    return [start, end]
  })
}

const isOpenAllDay = (hours?: string) => !!hours && /24時間|24\/7/.test(hours)

/** Nightlife venues — not what someone searching for a meal wants listed. */
const NIGHTLIFE = new Set(["girls_bar", "concept_cafe"])

/** Drinks-and-dessert places that don't serve a proper meal. */
const NON_MEAL = new Set([
  ...NIGHTLIFE,
  "bar",
  "cafe",
  "maid_cafe",
  "cat_cafe",
  "collab_cafe",
  "sweets",
])

const hasAny = (spot: Spot, keys: Set<string>) =>
  (spot.cuisine ?? []).some((c) => keys.has(c))

const servesMeals = (spot: Spot) =>
  (spot.cuisine?.length ?? 0) > 0 && !hasAny(spot, NON_MEAL)

export type GourmetScene = {
  slug: string
  /** Short label for nav chips, e.g. "ランチ". */
  label: string
  title: string
  heading: string
  description: (count: number) => string
  lead: string[]
  /** How the list was built — shown on the page so the criteria are honest. */
  criteria: string
  faqs: (spots: Spot[]) => { q: string; a: string }[]
  match: (spot: Spot) => boolean
}

const names = (spots: Spot[], n = 3) =>
  spots
    .slice(0, n)
    .map((s) => s.name)
    .join("、")

const HOURS_NOTE =
  "営業時間は変更される場合があるため、来店前に公式情報をご確認ください。"

/**
 * Search-intent pages ("秋葉原 ランチ", "秋葉原 深夜 ご飯", "秋葉原 個室") built
 * from data we already hold. Every scene is derived from hours or tags, never
 * hand-curated, so the lists stay correct as spots.json is updated.
 */
export const gourmetScenes: GourmetScene[] = [
  {
    slug: "lunch",
    label: "ランチ",
    title: "秋葉原のランチおすすめ店",
    heading: "秋葉原ランチガイド",
    description: (n) =>
      `秋葉原駅周辺でランチ営業している飲食店${n}件を駅から近い順に紹介。ラーメン・定食・カレー・焼肉・寿司など、電気街めぐりの合間や平日のお昼に使える店を地図と営業時間つきで探せます。`,
    lead: [
      "秋葉原は電気街やパーツ街をめぐる買い物客と、昭和通り口・岩本町側のオフィスで働く人が集まる街。昼どきはラーメン店や定食屋、カレー店などに行列ができることもあります。",
      "電気街口側はショップめぐりの合間に、昭和通り口・岩本町側は平日ランチに使いやすい店が中心。ジャンルと駅からの距離で選べるよう、昼の営業時間を確認できた店をまとめました。",
    ],
    criteria:
      "掲載基準：営業時間に正午〜13時30分を含む飲食店（カフェ・バー業態を除く）。",
    faqs: (spots) => [
      {
        q: "秋葉原でランチ営業している店は何件ありますか？",
        a: `アキバLiveでは、昼の営業時間を確認できた秋葉原駅周辺の飲食店を${spots.length}件掲載しています。${HOURS_NOTE}`,
      },
      {
        q: "秋葉原駅からすぐのランチは？",
        a: `一覧は秋葉原駅から近い順に並べています。${names(spots)}などが駅から近い店です。`,
      },
    ],
    match: (spot) =>
      servesMeals(spot) &&
      parseHourRanges(spot.hours).some(([s, e]) => s <= 12 * 60 && e >= 13 * 60 + 30),
  },
  {
    slug: "morning",
    label: "モーニング",
    title: "秋葉原の朝食・モーニングができる店",
    heading: "秋葉原 朝ごはん・モーニングガイド",
    description: (n) =>
      `秋葉原駅周辺で朝8時までに開店する飲食店・カフェ${n}件を紹介。出勤前の朝食やイベント待機前のモーニングに使える店を、開店時間と駅からの距離で探せます。`,
    lead: [
      "秋葉原の飲食店は昼前から開く店が多く、朝早くから営業している店は限られます。始発後の朝食や、イベント・物販の待機前に一息つける店を探す人向けに、朝8時までに開店する店をまとめました。",
    ],
    criteria: "掲載基準：営業時間の開始が朝8時以前の飲食店・カフェ。",
    faqs: (spots) => [
      {
        q: "秋葉原で朝早くから開いている店は？",
        a: `朝8時までに開店する店を${spots.length}件掲載しています。${names(spots)}などがあります。${HOURS_NOTE}`,
      },
    ],
    match: (spot) =>
      !hasAny(spot, NIGHTLIFE) &&
      !hasAny(spot, new Set(["bar"])) &&
      (isOpenAllDay(spot.hours) ||
        parseHourRanges(spot.hours).some(([s]) => s <= 8 * 60)),
  },
  {
    slug: "late-night",
    label: "深夜営業",
    title: "秋葉原の深夜営業の飲食店（夜0時まで営業）",
    heading: "秋葉原 深夜営業の飲食店ガイド",
    description: (n) =>
      `秋葉原駅周辺で深夜0時以降まで営業している飲食店${n}件を紹介。終電前後の食事や二次会に使える居酒屋・ラーメン店などを、営業時間と駅からの距離つきで探せます。`,
    lead: [
      "電気街の店は20時前後に閉まるところが多い一方、駅周辺や昭和通り口側には深夜まで開いている居酒屋・ラーメン店があります。イベント後の食事や終電前の一杯に使える店をまとめました。",
    ],
    criteria:
      "掲載基準：営業時間の終了が深夜0時以降、または24時間営業の飲食店（曜日限定を含む）。",
    faqs: (spots) => [
      {
        q: "秋葉原で深夜0時まで開いている飲食店は？",
        a: `深夜0時以降まで営業している店を${spots.length}件掲載しています。${names(spots)}などが駅から近い店です。曜日によって閉店時間が異なる店もあります。${HOURS_NOTE}`,
      },
    ],
    match: (spot) =>
      !hasAny(spot, NIGHTLIFE) &&
      (isOpenAllDay(spot.hours) ||
        parseHourRanges(spot.hours).some(([, e]) => e >= 24 * 60)),
  },
  {
    slug: "private-room",
    label: "個室",
    title: "秋葉原の個室がある飲食店",
    heading: "秋葉原 個室ありの飲食店ガイド",
    description: (n) =>
      `秋葉原駅周辺で個室を備えた居酒屋・焼肉店など${n}件を紹介。会社の飲み会や接待、少人数の集まりに使える店を、駅からの距離と営業時間つきで探せます。`,
    lead: [
      "秋葉原駅周辺には、会社帰りの飲み会や宴会向けに個室を用意した居酒屋が集まっています。周りを気にせず話したい集まりや接待に使える店をまとめました。",
    ],
    criteria:
      "掲載基準：店舗情報で個室の用意を確認できた店。個室の数や人数、予約条件は店舗にご確認ください。",
    faqs: (spots) => [
      {
        q: "秋葉原で個室がある飲食店は？",
        a: `個室を確認できた店を${spots.length}件掲載しています。${names(spots)}などがあります。個室は予約制の場合が多いため、事前に店舗へご確認ください。`,
      },
    ],
    match: (spot) => !!spot.tags?.includes("個室"),
  },
  {
    slug: "all-you-can-drink",
    label: "飲み放題",
    title: "秋葉原の飲み放題がある居酒屋・飲食店",
    heading: "秋葉原 飲み放題ありの店ガイド",
    description: (n) =>
      `秋葉原駅周辺で飲み放題プランがある居酒屋・飲食店${n}件を紹介。歓送迎会や忘年会、オフ会に使える店を地図と営業時間つきで探せます。`,
    lead: [
      "秋葉原駅周辺の居酒屋チェーンや宴会向けの店では、コース料理とセットにした飲み放題プランを用意している店が多くあります。人数の多い集まりに使える店をまとめました。",
    ],
    criteria:
      "掲載基準：店舗情報で飲み放題プランを確認できた店。料金・時間・対象メニューは店舗にご確認ください。",
    faqs: (spots) => [
      {
        q: "秋葉原で飲み放題がある店は？",
        a: `飲み放題プランを確認できた店を${spots.length}件掲載しています。${names(spots)}などがあります。プラン内容は変わることがあるため、予約時に店舗へご確認ください。`,
      },
    ],
    match: (spot) => !!spot.tags?.includes("飲み放題"),
  },
]

export const MIN_SPOTS_PER_SCENE_PAGE = 5

export const getSpotsByScene = (scene: GourmetScene): Spot[] =>
  sortGourmetSpots(getGourmetSpots().filter(scene.match))

/** Scenes with enough spots behind them to publish. */
export const getPagedScenes = (): GourmetScene[] =>
  gourmetScenes.filter(
    (scene) => getSpotsByScene(scene).length >= MIN_SPOTS_PER_SCENE_PAGE,
  )

export const getSceneBySlug = (slug: string): GourmetScene | undefined =>
  getPagedScenes().find((scene) => scene.slug === slug)

/** Scenes a given spot appears in — used to cross-link from detail pages. */
export const getScenesForSpot = (spot: Spot): GourmetScene[] =>
  getPagedScenes().filter((scene) => scene.match(spot))

/**
 * schema.org `openingHours` must be in the "Mo-Fr 09:00-17:00" form. Japanese
 * free text ("月〜金 11:00〜22:00") is not, and invalid values only earn
 * structured-data warnings, so pass it through only when it already fits.
 */
export const schemaOpeningHours = (hours?: string): string | undefined =>
  hours &&
  /^(Mo|Tu|We|Th|Fr|Sa|Su|PH)[\w ,\-:;]*\d{2}:\d{2}-\d{2}:\d{2}[\w ,\-:;]*$/.test(
    hours.trim(),
  )
    ? hours.trim()
    : undefined

/**
 * Ward taken from the address itself. Spots straddle 千代田区 and 台東区, so a
 * hard-coded locality would be wrong for a good share of them.
 */
export const addressLocality = (address?: string): string | undefined =>
  address?.match(/(千代田区|台東区|中央区|文京区)/)?.[1]

/** The ItemList of Restaurant entries every gourmet index page publishes. */
export const gourmetItemListLd = ({
  name,
  description,
  url,
  spots,
}: {
  name: string
  description: string
  url: string
  spots: Spot[]
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  description,
  url,
  numberOfItems: spots.length,
  itemListElement: spots.map((spot, i) => {
    const openingHours = schemaOpeningHours(spot.hours)
    return {
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Restaurant",
        name: spot.name,
        ...(spot.image?.src ? { image: absoluteUrl(spot.image.src) } : {}),
        ...(spot.cuisine?.length
          ? { servesCuisine: spot.cuisine.map(getCuisineLabel) }
          : {}),
        ...(openingHours ? { openingHours } : {}),
        ...(spot.address
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: spot.address,
                ...(addressLocality(spot.address)
                  ? { addressLocality: addressLocality(spot.address) }
                  : {}),
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
    }
  }),
})
