import spotsData from "../data/spots.json"

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

export type SpotDataSource = "manual" | "osm" | "taito-opendata" | "akiba-or"

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
  dataSource?: SpotDataSource
  /** ISO date the details were last checked against a source. */
  lastVerified?: string
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

/** Spots first, so the ones we can actually link to lead the list. */
export const sortGourmetSpots = (spots: Spot[]): Spot[] =>
  [...spots].sort((a, b) => {
    const aLinkable = hasDetailPage(a) ? 0 : 1
    const bLinkable = hasDetailPage(b) ? 0 : 1
    if (aLinkable !== bLinkable) return aLinkable - bLinkable
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
