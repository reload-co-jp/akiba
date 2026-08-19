import spotsData from "../data/spots.json"
import type { EditorComment } from "./editor-comment"

export type SpotCategory = "電気街・PCパーツ" | "アニメ・マンガ・同人" | "ゲーム・フィギュア" | "グルメ・カフェ" | "ショッピング" | "フィギュア・模型" | "イベント・ライブ"

export type SpotLocalizedContent = {
  name: string
  description: string
  access?: string
  hours?: string
  closed?: string
  admission?: string
}

/**
 * "A" spots get their own detail page: we know enough about them (address,
 * opening hours, or a first-party source) for the page to stand on its own.
 * "B" spots are name + location only — they appear in the gourmet index
 * pages but never get a detail page of their own, so we don't publish
 * hundreds of near-empty pages. Missing tier means "A" for the hand-written
 * spots that predate this field.
 */
export type SpotTier = "A" | "B"

export type SpotDataSource =
  | "manual"
  | "osm"
  | "taito-opendata"
  | "akiba-or"
  /** Town-level address derived from coordinates — no block or building number. */
  | "gsi-reverse"

export type Spot = {
  id: number
  name: string
  slug: string
  category: SpotCategory
  description: string
  /** Optional: bulk-imported spots often only have coordinates. */
  address?: string
  access?: string
  hours?: string
  closed?: string
  admission?: string
  website?: string
  lat?: number
  lng?: number
  image?: {
    src: string
    alt: string
    width?: number
    height?: number
    sourceLabel?: string
    sourceUrl?: string
    /** true = 第三者投稿写真・メディア記事等、権利関係が明確でないソース。要差し替え検討。 */
    copyrightRisk?: boolean
  }
  en?: SpotLocalizedContent
  tags?: string[]
  aliases?: string[]
  /** Cuisine keys, roughly following the OSM `cuisine` tag (ramen, curry, …). */
  cuisine?: string[]
  priceRange?: string
  tier?: SpotTier
  /** OSM element id (e.g. "node/1234567"), used to re-match on refresh. */
  osmId?: string
  /** Where the record itself came from. Drives ODbL attribution for "osm". */
  dataSource?: SpotDataSource
  /**
   * Set only when the address was filled in from somewhere other than
   * dataSource — kept separate so enriching an address never erases the
   * record's origin, and with it the reason we owe an attribution.
   */
  addressSource?: SpotDataSource
  /** ISO date the details were last checked against a source. */
  lastVerified?: string
  /** 編集部コメント。設定時のみスポット詳細ページに表示。 */
  editorComment?: EditorComment
}

export const placeholderSpotImage = {
  src: "/images/placeholder.jpg",
  alt: "アキバLiveのスポット画像",
  width: 1024,
  height: 683,
}

export const getSpotImage = (spot: Spot) => spot.image ?? placeholderSpotImage

const unique = (items: Array<string | undefined>) =>
  Array.from(
    new Set(
      items
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item)),
    ),
  )

export const getSpotSeoKeywords = (spot: Spot): string[] => {
  const features = [spot.category, ...(spot.tags ?? [])]

  return unique([
    "秋葉原",
    "アキバ",
    "神田",
    "末広町",
    "御茶ノ水",
    "東京都千代田区",
    "秋葉原 観光",
    "秋葉原 スポット",
    "秋葉原 イベント会場",
    `${spot.name} アクセス`,
    `${spot.name} 営業時間`,
    `${spot.name} イベント`,
    `秋葉原 ${spot.name}`,
    `神田 ${spot.name}`,
    ...features,
    ...features.flatMap((feature) => [
      `秋葉原 ${feature}`,
      `神田 ${feature}`,
      `${spot.name} ${feature}`,
    ]),
  ]).slice(0, 30)
}

/** Every spot, including tier B ones that have no detail page. */
export const getAllSpots = (): Spot[] => spotsData as Spot[]

/**
 * Whether this spot gets its own /spots/[slug]/ page. Everything that links
 * to a detail page must go through here, or we end up linking to 404s.
 */
export const hasDetailPage = (spot: Spot): boolean => spot.tier !== "B"

/** Spots with a detail page — what the /spots/ index should list. */
export const getDetailPageSpots = (): Spot[] =>
  (spotsData as Spot[]).filter(hasDetailPage)

export const getSpotBySlug = (slug: string): Spot | undefined =>
  (spotsData as Spot[]).find((s) => s.slug === slug)

export const getAllSpotSlugs = (): string[] =>
  getDetailPageSpots().map((s) => s.slug)

export const getSpotsByCategory = (category: SpotCategory): Spot[] =>
  getDetailPageSpots().filter((s) => s.category === category)

export const getAllSpotCategories = (): SpotCategory[] =>
  Array.from(new Set(getDetailPageSpots().map((s) => s.category)))

/**
 * Japanese shop-type nouns for each cuisine key. Each value has to read
 * naturally on its own as a page heading ("秋葉原のラーメン店").
 * Mirrors CUISINE_SHOP_LABELS in scripts/merge-osm-gourmet.py.
 */
export const cuisineLabels: Record<string, string> = {
  maid_cafe: "メイドカフェ",
  collab_cafe: "コラボカフェ",
  cat_cafe: "猫カフェ",
  cafe: "カフェ",
  izakaya: "居酒屋",
  bar: "バー",
  ramen: "ラーメン店",
  noodle: "麺類店",
  soba: "そば店",
  udon: "うどん店",
  sushi: "寿司店",
  japanese: "和食店",
  chinese: "中華料理店",
  curry: "カレー店",
  italian: "イタリアン",
  french: "フレンチ",
  korean: "韓国料理店",
  indian: "インド料理店",
  thai: "タイ料理店",
  vietnamese: "ベトナム料理店",
  mexican: "メキシコ料理店",
  spanish: "スペイン料理店",
  american: "アメリカン料理店",
  asian: "アジア料理店",
  international: "各国料理店",
  regional: "郷土料理店",
  yakiniku: "焼肉店",
  tonkatsu: "とんかつ店",
  chicken: "鶏料理店",
  takoyaki: "たこ焼き店",
  fried_food: "揚げ物店",
  western: "洋食店",
  tempura: "天ぷら店",
  steak: "ステーキ店",
  seafood: "海鮮料理店",
  fish: "魚料理店",
  unagi: "うなぎ店",
  donburi: "丼もの店",
  beef_bowl: "牛丼店",
  gyoza: "餃子店",
  okonomiyaki: "お好み焼き店",
  yakisoba: "焼きそば店",
  shabu_shabu: "しゃぶしゃぶ店",
  sukiyaki: "すき焼き店",
  teppanyaki: "鉄板焼き店",
  hot_pot: "鍋料理店",
  oden: "おでん店",
  pizza: "ピザ店",
  burger: "ハンバーガー店",
  sandwich: "サンドイッチ店",
  kebab: "ケバブ店",
  sweets: "スイーツ店",
  crepe: "クレープ店",
  bubble_tea: "タピオカ店",
}

export const getCuisineLabel = (cuisine: string): string =>
  cuisineLabels[cuisine] ?? cuisine

/**
 * How a spot's own page describes itself. Spots started out as event venues,
 * but the directory now includes restaurants and shops, and calling a ramen
 * shop an イベント会場 is simply wrong.
 */
export const getSpotHeadline = (spot: Spot) => {
  if (spot.category === "グルメ・カフェ") {
    return {
      heading: `${spot.name}｜秋葉原のグルメ・アクセス`,
      title: `${spot.name}｜秋葉原のグルメ・アクセス・営業時間`,
      description: `${spot.name}のアクセス、営業時間、住所を紹介。秋葉原で食事や休憩ができる店を探すときに。`,
    }
  }
  return {
    heading: `${spot.name}｜秋葉原のイベント会場・アクセス`,
    title: `${spot.name}｜秋葉原のイベント会場・アクセス・営業時間`,
    description: `${spot.name}のアクセス、営業時間、住所、関連イベントを紹介。秋葉原で開催中・開催予定のイベント確認にも使えます。`,
  }
}

/**
 * A cuisine needs enough places behind it to be worth its own page — one or
 * two entries makes a page with nothing on it. Everything below the bar still
 * appears on the main gourmet index.
 */
export const MIN_SPOTS_PER_CUISINE_PAGE = 5

/** Gourmet spots of every tier — the source for the gourmet index pages. */
export const getGourmetSpots = (): Spot[] =>
  (spotsData as Spot[]).filter((s) => s.category === "グルメ・カフェ")

export const getSpotsByCuisine = (cuisine: string): Spot[] =>
  getGourmetSpots().filter((s) => s.cuisine?.includes(cuisine))

export const getAllCuisines = (): string[] =>
  Array.from(new Set(getGourmetSpots().flatMap((s) => s.cuisine ?? []))).sort()

/** Cuisines that get their own /spots/gourmet/[cuisine]/ page. */
export const getPagedCuisines = (): string[] =>
  getAllCuisines()
    .filter(
      (c) =>
        cuisineLabels[c] !== undefined &&
        getSpotsByCuisine(c).length >= MIN_SPOTS_PER_CUISINE_PAGE,
    )
    .sort((a, b) => getSpotsByCuisine(b).length - getSpotsByCuisine(a).length)

/** JR Akihabara Station, Electric Town exit. */
export const AKIHABARA_STATION = { lat: 35.698383, lng: 139.773071 }

/**
 * Straight-line distance from Akihabara Station, in metres, rounded to 10m to
 * avoid implying more precision than a point-to-point measure deserves.
 *
 * Deliberately not converted to walking minutes: the Japanese convention for
 * "徒歩◯分" is road distance at 80m/min, and quoting a straight-line figure
 * that way would understate every entry. Pages label this as 直線距離.
 */
export const distanceFromStation = (spot: Spot): number | undefined => {
  if (spot.lat == null || spot.lng == null) return undefined
  const meanLat = ((spot.lat + AKIHABARA_STATION.lat) / 2) * (Math.PI / 180)
  const x =
    (spot.lng - AKIHABARA_STATION.lng) * (Math.PI / 180) * Math.cos(meanLat)
  const y = (spot.lat - AKIHABARA_STATION.lat) * (Math.PI / 180)
  const metres = Math.hypot(x, y) * 6371000
  return Math.round(metres / 10) * 10
}

/**
 * Spots with their own page lead — they are the ones with an image, a written
 * description and related coverage. Everything else follows by how close it is
 * to the station, which is the most useful ordering for a directory.
 */
export const sortGourmetSpots = (spots: Spot[]): Spot[] =>
  [...spots].sort((a, b) => {
    const aLinkable = hasDetailPage(a) ? 0 : 1
    const bLinkable = hasDetailPage(b) ? 0 : 1
    if (aLinkable !== bLinkable) return aLinkable - bLinkable

    const aDist = distanceFromStation(a)
    const bDist = distanceFromStation(b)
    if (aDist != null && bDist != null && aDist !== bDist) return aDist - bDist
    if (aDist == null && bDist != null) return 1
    if (aDist != null && bDist == null) return -1

    return a.name.localeCompare(b.name, "ja")
  })

export const getSpotByVenueName = (venue: string): Spot | undefined => {
  // Only tier A: an article linking to a tier B spot would 404.
  return getDetailPageSpots().find(
    (spot) =>
      venue.includes(spot.name) ||
      spot.name.includes(venue) ||
      spot.aliases?.some(
        (alias) => venue.includes(alias) || alias.includes(venue),
      ),
  )
}

/**
 * Same idea as getSpotByVenueName but for articles without an event.venue —
 * matches on a plain-text mention of the spot's name in the title/body so
 * closures, one-off news, etc. still link back to their spot page.
 */
export const getSpotForArticle = (article: {
  title: string
  content: string
  event?: { venue: string }
}): Spot | undefined => {
  if (article.event) {
    const bySpot = getSpotByVenueName(article.event.venue)
    if (bySpot) return bySpot
  }
  const text = `${article.title} ${article.content}`
  return getDetailPageSpots().find((spot) => {
    const names = [spot.name, ...(spot.aliases ?? [])]
    return names.some((name) => name.length >= 3 && text.includes(name))
  })
}

export const getLocalizedSpotContent = (spot: Spot, lang: "ja" | "en"): SpotLocalizedContent => {
  if (lang === "en" && spot.en) return spot.en
  return {
    name: spot.name,
    description: spot.description,
    access: spot.access,
    hours: spot.hours,
    closed: spot.closed,
    admission: spot.admission,
  }
}
