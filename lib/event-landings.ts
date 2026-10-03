import {
  getAllArticles,
  getAllTagsData,
  getArticlesByTagId,
  getTagById,
  type Article,
  type Tag,
} from "./articles"
import { getDetailPageSpots, getSpotBySlug, type Spot } from "./spots"

/**
 * 「秋葉原 {スポット/作品} イベント」検索の受け皿ページ。
 * 1〜2件しかないページは薄いコンテンツになるため下限を設ける。
 */
export const MIN_EVENTS_PER_LANDING = 2

const isEvent = (a: Article): a is Article & { event: NonNullable<Article["event"]> } =>
  Boolean(a.event)

/** event.venue だけで照合（本文言及は拾わない＝そのスポットで開催されたものに限定）。 */
export const getEventsAtSpot = (spot: Spot) => {
  const names = [spot.name, ...(spot.aliases ?? [])]
  return getAllArticles()
    .filter(isEvent)
    .filter((a) =>
      names.some((name) => a.event.venue.includes(name) || name.includes(a.event.venue)),
    )
}

export const getEventsForWork = (tag: Tag) => getArticlesByTagId(tag.id).filter(isEvent)

export const getVenueLandingSpots = (): Spot[] =>
  getDetailPageSpots().filter((s) => getEventsAtSpot(s).length >= MIN_EVENTS_PER_LANDING)

export const getWorkLandingTags = (): Tag[] =>
  getAllTagsData().filter(
    (t) => t.kind === "work" && getEventsForWork(t).length >= MIN_EVENTS_PER_LANDING,
  )

export const hasVenueLanding = (slug: string) => {
  const spot = getSpotBySlug(slug)
  return Boolean(spot && getEventsAtSpot(spot).length >= MIN_EVENTS_PER_LANDING)
}

export const hasWorkLanding = (id: number) => {
  const tag = getTagById(id)
  return Boolean(tag?.kind === "work" && getEventsForWork(tag).length >= MIN_EVENTS_PER_LANDING)
}

/** 開催中・開催予定・終了に分割。終了分は新しい順。 */
export const splitByStatus = (events: ReturnType<typeof getEventsForWork>, today: string) => ({
  ongoing: events
    .filter((a) => a.event.startDate <= today && today <= a.event.endDate)
    .sort((a, b) => a.event.endDate.localeCompare(b.event.endDate)),
  upcoming: events
    .filter((a) => a.event.startDate > today)
    .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate)),
  past: events
    .filter((a) => a.event.endDate < today)
    .sort((a, b) => b.event.endDate.localeCompare(a.event.endDate)),
})

export const landingMetadata = (
  path: string,
  title: string,
  description: string,
  keywords: string[],
) => ({
  title,
  description,
  keywords,
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
})

type Events = ReturnType<typeof getEventsForWork>

/** イベント群に登場する作品タグ（作品別ページがあるもの）。会場→作品の相互リンク用。 */
export const getWorkLinksFor = (events: Events) => {
  const tags = getWorkLandingTags()
  return tags
    .map((t) => ({
      href: `/events/work/${t.id}/`,
      label: t.name,
      count: events.filter((a) => a.tagIds.includes(t.id)).length,
    }))
    .filter((l) => l.count > 0)
    .sort((a, b) => b.count - a.count)
}

/** イベント群の開催会場（会場別ページがあるもの）。作品→会場の相互リンク用。 */
export const getVenueLinksFor = (events: Events) =>
  getVenueLandingSpots()
    .map((spot) => {
      const ids = new Set(getEventsAtSpot(spot).map((a) => a.id))
      return {
        href: `/events/venue/${spot.slug}/`,
        label: spot.name,
        count: events.filter((a) => ids.has(a.id)).length,
      }
    })
    .filter((l) => l.count > 0)
    .sort((a, b) => b.count - a.count)

/** meta description 末尾に付ける件数・直近イベント。検索結果での鮮度訴求。 */
export const landingDescriptionSuffix = (events: Events) => {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" })
  const { ongoing, upcoming } = splitByStatus(events, today)
  const next = ongoing[0] ?? upcoming[0]
  return `開催中${ongoing.length}件・開催予定${upcoming.length}件${next ? `（${next.title.slice(0, 40)}など）` : ""}。`
}
