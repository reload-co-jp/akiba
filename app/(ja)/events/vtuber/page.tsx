import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import {
  getEventsMatching,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"

const VTUBER_TAG_ID = 29
const VTUBER_TITLE = /VTuber|Vtuber|ホロライブ|にじさんじ|ぶいすぽ/
const path = "/events/vtuber/"
const description =
  "秋葉原で開催中・開催予定のVTuberイベントを一覧で紹介。ホロライブ・にじさんじなどのポップアップストア・コラボカフェ・コラボキャンペーンを会場・期間・料金・公式リンク付きで確認できます。"
const events = getEventsMatching(
  (a) => a.tagIds.includes(VTUBER_TAG_ID) || VTUBER_TITLE.test(a.title)
)

export const metadata = landingMetadata(
  path,
  "秋葉原のVTuberイベント一覧【開催中・予定】",
  description + landingDescriptionSuffix(events),
  [
    "秋葉原 VTuber",
    "秋葉原 VTuber イベント",
    "秋葉原 ホロライブ",
    "秋葉原 にじさんじ",
  ]
)

const Page = () => (
  <EventLanding
    path={path}
    title="秋葉原のVTuberイベント一覧"
    kicker="VTuber Events in Akihabara"
    breadcrumbLabel="VTuberイベント特集"
    description={description}
    about={{ "@type": "Thing", name: "VTuberイベント" }}
    lead="秋葉原ではホロライブやにじさんじなど、人気VTuberのポップアップストアやコラボカフェ、ショップとのコラボキャンペーンが開催中。限定グッズや購入特典つきのイベントを会場・期間・料金つきでまとめて紹介。過去に開催されたイベントもあわせてチェックしよう。"
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
