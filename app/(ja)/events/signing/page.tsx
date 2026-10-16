import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import {
  getEventsMatching,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"

const SIGNING_TAG_ID = 86
const SIGNING_TITLE = /サイン会|お渡し会|握手会|リリースイベント|リリイベ/
const path = "/events/signing/"
const description =
  "秋葉原で開催予定のサイン会・お渡し会・握手会を一覧で紹介。書泉ブックタワー・ゲーマーズ・アニメイトなどで開催される写真集・書籍・CDのリリースイベントを会場・日程・参加条件・公式リンク付きで確認できます。"
const events = getEventsMatching(
  (a) => a.tagIds.includes(SIGNING_TAG_ID) || SIGNING_TITLE.test(a.title)
)

export const metadata = landingMetadata(
  path,
  "秋葉原のサイン会・お渡し会一覧【開催予定】",
  description + landingDescriptionSuffix(events),
  [
    "秋葉原 サイン会",
    "秋葉原 お渡し会",
    "秋葉原 握手会",
    "秋葉原 リリースイベント",
  ]
)

const Page = () => (
  <EventLanding
    path={path}
    title="秋葉原のサイン会・お渡し会一覧"
    kicker="Signing Events in Akihabara"
    breadcrumbLabel="サイン会特集"
    description={description}
    about={{ "@type": "Thing", name: "サイン会" }}
    lead="秋葉原では書泉ブックタワーやゲーマーズ、アニメイトなどで、写真集・書籍・CDの発売記念サイン会やお渡し会が数多く開催されている。参加には対象商品の購入や整理券が必要な場合が多いので、日程と参加条件を早めにチェックしよう。過去に開催されたサイン会もあわせて紹介。"
    events={events}
    related={[
      { href: "/events/today/", label: "今日のイベント" },
      { href: "/events/this-week/", label: "今週のイベント" },
      { href: "/events/popup/", label: "POPUPストア特集" },
    ]}
    showMap
    pastLimit={12}
  >
    <AdsenseDisplayAd />
  </EventLanding>
)

export default Page
