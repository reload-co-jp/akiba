import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import {
  getEventsMatching,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"

const ANIME_TAG_ID = 47
const path = "/events/anime/"
const description =
  "秋葉原で開催中・開催予定のアニメイベントを一覧で紹介。アニメのポップアップストア・コラボカフェ・原画展・フェアなどを会場・期間・料金・公式リンク付きで確認できます。"
const events = getEventsMatching((a) => a.tagIds.includes(ANIME_TAG_ID))

export const metadata = landingMetadata(
  path,
  "秋葉原のアニメイベント一覧【開催中・予定】",
  description + landingDescriptionSuffix(events),
  [
    "秋葉原 アニメ イベント",
    "秋葉原 アニメ",
    "秋葉原 アニメ ポップアップ",
    "秋葉原 アニメ コラボ",
  ]
)

const Page = () => (
  <EventLanding
    path={path}
    title="秋葉原のアニメイベント一覧"
    kicker="Anime Events in Akihabara"
    breadcrumbLabel="アニメイベント特集"
    description={description}
    about={{ "@type": "Thing", name: "アニメイベント" }}
    lead="秋葉原では人気アニメのポップアップストアやコラボカフェ、原画展、ショップのフェアが毎週のように開催中。限定グッズや描き下ろしイラスト、購入特典つきのイベントを会場・期間・料金つきでまとめて紹介。推し作品のイベントを見逃さないようにチェックしよう。"
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
