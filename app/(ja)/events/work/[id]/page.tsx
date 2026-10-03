import { notFound } from "next/navigation"
import { getTagById } from "lib/articles"
import {
  getEventsForWork,
  getWorkLandingTags,
  getVenueLinksFor,
  hasWorkLanding,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"
import { EventLanding, LandingLinks } from "components/event-landing"
import { EventSection } from "components/event-section"

const description = (name: string) =>
  `秋葉原で開催中・開催予定の${name}関連イベントを一覧で紹介。コラボカフェ、ポップアップストア、展示、フェアなどを会場・会期付きでまとめています。`

type Props = {
  params: Promise<{ id: string }>
}

export const generateStaticParams = () =>
  getWorkLandingTags().map((tag) => ({ id: String(tag.id) }))

export const generateMetadata = async ({ params }: Props) => {
  const { id } = await params
  const tag = getTagById(Number(id))
  if (!tag || !hasWorkLanding(tag.id)) return {}
  return landingMetadata(
    `/events/work/${id}/`,
    `秋葉原の${tag.name}イベント情報【開催中・開催予定】コラボ・ポップアップ`,
    description(tag.name) + landingDescriptionSuffix(getEventsForWork(tag)),
    [
      "秋葉原",
      tag.name,
      `秋葉原 ${tag.name} イベント`,
      `${tag.name} イベント 秋葉原`,
      `${tag.name} コラボカフェ`,
      `${tag.name} ポップアップ`,
      `${tag.name} イベント`,
    ],
  )
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const tag = getTagById(Number(id))
  if (!tag || !hasWorkLanding(tag.id)) notFound()

  const events = getEventsForWork(tag)
  const venueLinks = getVenueLinksFor(events)

  return (
    <EventLanding
      path={`/events/work/${id}/`}
      title={`秋葉原の${tag.name}イベント情報`}
      kicker="Events by Title"
      breadcrumbLabel={`${tag.name}のイベント`}
      section={{ label: "作品別イベント", href: "/events/work/" }}
      description={description(tag.name)}
      about={{ "@type": "CreativeWork", name: tag.name, alternateName: tag.nameEn }}
      lead={`秋葉原で開催される${tag.name}関連のコラボカフェ、ポップアップストア、展示、フェアなどを、開催中・開催予定・過去の開催に分けてまとめました。`}
      events={events}
      related={[
        { href: `/tags/${id}/`, label: `「${tag.name}」の記事・ニュース` },
        { href: "/events/work/", label: "作品別イベント一覧" },
      ]}
      showMap
    >
      {venueLinks.length > 0 && (
        <EventSection id="venues-heading" kicker="Venues" title={`${tag.name}のイベント開催会場`}>
          <LandingLinks items={venueLinks} />
        </EventSection>
      )}
    </EventLanding>
  )
}

export default Page
