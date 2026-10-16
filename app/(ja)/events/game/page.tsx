import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import {
  getEventsMatching,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"

const GAME_TAG_ID = 74
const path = "/events/game/"
const description =
  "秋葉原で開催中・開催予定のゲームイベントを一覧で紹介。ゲームのポップアップストア・コラボカフェ・体験会・大会・キャンペーンなどを会場・期間・料金・公式リンク付きで確認できます。"
const events = getEventsMatching((a) => a.tagIds.includes(GAME_TAG_ID))

export const metadata = landingMetadata(
  path,
  "秋葉原のゲームイベント一覧【開催中・予定】",
  description + landingDescriptionSuffix(events),
  [
    "秋葉原 ゲーム イベント",
    "秋葉原 ゲーム",
    "秋葉原 ゲーム ポップアップ",
    "秋葉原 ゲーム コラボ",
  ]
)

const Page = () => (
  <EventLanding
    path={path}
    title="秋葉原のゲームイベント一覧"
    kicker="Game Events in Akihabara"
    breadcrumbLabel="ゲームイベント特集"
    description={description}
    about={{ "@type": "Thing", name: "ゲームイベント" }}
    lead="秋葉原ではゲームのポップアップストアやコラボカフェ、試遊・体験会、ゲームセンターのキャンペーンなどが続々開催中。限定グッズや来場特典つきのイベントを会場・期間・料金つきでまとめて紹介。気になるタイトルのイベントをチェックしよう。"
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
