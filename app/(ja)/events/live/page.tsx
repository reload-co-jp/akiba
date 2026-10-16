import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import {
  getEventsMatching,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"

const LIVE_TAG_IDS = [139, 140]
const path = "/events/live/"
const description =
  "秋葉原のライブ・ライブハウス公演スケジュールを一覧で紹介。今日のライブから開催予定のアイドル・バンド・アニソン公演まで、会場・日程・料金・公式リンク付きで確認できます。"
const events = getEventsMatching((a) =>
  a.tagIds.some((tid) => LIVE_TAG_IDS.includes(tid))
)

export const metadata = landingMetadata(
  path,
  "秋葉原ライブスケジュール【今日・開催予定】",
  description + landingDescriptionSuffix(events),
  [
    "秋葉原 ライブ",
    "秋葉原 ライブ 今日",
    "秋葉原 ライブハウス",
    "秋葉原 ライブ スケジュール",
  ]
)

const Page = () => (
  <EventLanding
    path={path}
    title="秋葉原ライブスケジュール"
    kicker="Live in Akihabara"
    breadcrumbLabel="ライブスケジュール"
    description={description}
    about={{ "@type": "Thing", name: "ライブスケジュール" }}
    lead="秋葉原ではCLUB GOODMANをはじめとするライブハウスやイベントスペースで、アイドル・バンド・アニソンのライブが毎日のように開催中。今日行けるライブと今後の公演予定を、会場・日程・料金つきでまとめて紹介。仕事帰りにふらっと寄れる公演も多いので、気になるライブをチェックしよう。"
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
