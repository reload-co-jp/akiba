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

export type Spot = {
  id: number
  name: string
  slug: string
  category: SpotCategory
  description: string
  address: string
  access: string
  hours: string
  closed: string
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
}

export const placeholderSpotImage = {
  src: "/images/placeholder.jpg",
  alt: "アキバLiveのスポット画像",
  width: 1024,
  height: 683,
}

export const getSpotImage = (spot: Spot) => spot.image ?? placeholderSpotImage

export const getAllSpots = (): Spot[] => spotsData as Spot[]

export const getSpotBySlug = (slug: string): Spot | undefined =>
  (spotsData as Spot[]).find((s) => s.slug === slug)

export const getAllSpotSlugs = (): string[] =>
  (spotsData as Spot[]).map((s) => s.slug)

export const getSpotsByCategory = (category: SpotCategory): Spot[] =>
  (spotsData as Spot[]).filter((s) => s.category === category)

export const getAllSpotCategories = (): SpotCategory[] =>
  Array.from(new Set((spotsData as Spot[]).map((s) => s.category)))

export const getSpotByVenueName = (venue: string): Spot | undefined => {
  const spots = getAllSpots()
  return spots.find(
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
