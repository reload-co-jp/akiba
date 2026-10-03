import { notFound } from "next/navigation"
import { getSpotBySlug } from "lib/spots"
import {
  getEventsAtSpot,
  getVenueLandingSpots,
  getWorkLinksFor,
  hasVenueLanding,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"
import { absoluteUrl } from "lib/site"
import { EventLanding, LandingLinks } from "components/event-landing"
import { EventSection } from "components/event-section"

const description = (name: string) =>
  `秋葉原・${name}で開催中・開催予定のイベント、ポップアップ、フェア、サイン会などを会期付きで一覧化。`

type Props = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () =>
  getVenueLandingSpots().map((spot) => ({ slug: spot.slug }))

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params
  const spot = getSpotBySlug(slug)
  if (!spot || !hasVenueLanding(slug)) return {}
  const short = spot.aliases?.[0] ?? spot.name
  return landingMetadata(
    `/events/venue/${slug}/`,
    `${spot.name}のイベント情報【開催中・開催予定】｜秋葉原`,
    description(spot.name) + landingDescriptionSuffix(getEventsAtSpot(spot)),
    [
      "秋葉原",
      spot.name,
      `秋葉原 ${spot.name} イベント`,
      `${spot.name} イベント`,
      `秋葉原 ${short} イベント`,
      `${short} イベント 今日`,
      `${spot.name} ポップアップ`,
    ],
  )
}

const Page = async ({ params }: Props) => {
  const { slug } = await params
  const spot = getSpotBySlug(slug)
  if (!spot || !hasVenueLanding(slug)) notFound()

  const events = getEventsAtSpot(spot)
  const workLinks = getWorkLinksFor(events)

  return (
    <EventLanding
      path={`/events/venue/${slug}/`}
      title={`${spot.name}のイベント情報`}
      kicker="Events by Venue"
      breadcrumbLabel={`${spot.name}のイベント`}
      section={{ label: "会場別イベント", href: "/events/venue/" }}
      description={description(spot.name)}
      about={{
        "@type": "Place",
        name: spot.name,
        url: absoluteUrl(`/spots/${slug}/`),
        ...(spot.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: spot.address,
            addressRegion: "東京都",
            addressCountry: "JP",
          },
        }),
        ...(spot.lat != null &&
          spot.lng != null && {
            geo: { "@type": "GeoCoordinates", latitude: spot.lat, longitude: spot.lng },
          }),
      }}
      lead={`秋葉原の${spot.name}で開催されるイベントを、開催中・開催予定・過去の開催に分けてまとめました。会期や会場の詳細は各記事で確認できます。`}
      events={events}
      related={[
        { href: `/spots/${slug}/`, label: `${spot.name}のアクセス・営業時間` },
        { href: "/events/venue/", label: "会場別イベント一覧" },
      ]}
    >
      {workLinks.length > 0 && (
        <EventSection id="works-heading" kicker="Titles" title={`${spot.name}でイベントを開催した作品`}>
          <LandingLinks items={workLinks} />
        </EventSection>
      )}
    </EventLanding>
  )
}

export default Page
