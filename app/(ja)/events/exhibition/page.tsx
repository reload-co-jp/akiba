import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import {
  getEventsMatching,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"

const EXHIBITION_TAG_ID = 177
const EXHIBITION_TITLE = /原画展|展示|展覧会|企画展|作品展|写真展|パネル展/
const path = "/events/exhibition/"
const description =
  "秋葉原で開催中・開催予定の展示・原画展を一覧で紹介。アニメ・ゲームの原画展や複製原画・場面写の展示、フィギュアの完成見本展示などを会場・期間・料金・公式リンク付きで確認できます。"
const events = getEventsMatching(
  (a) => a.tagIds.includes(EXHIBITION_TAG_ID) || EXHIBITION_TITLE.test(a.title)
)

export const metadata = landingMetadata(
  path,
  "秋葉原の展示・原画展一覧【開催中・予定】",
  description + landingDescriptionSuffix(events),
  ["秋葉原 展示", "秋葉原 原画展", "秋葉原 展示会", "秋葉原 展示 イベント"]
)

const Page = () => (
  <EventLanding
    path={path}
    title="秋葉原の展示・原画展一覧"
    kicker="Exhibitions in Akihabara"
    breadcrumbLabel="展示・原画展特集"
    description={description}
    about={{ "@type": "Thing", name: "展示・原画展" }}
    lead="秋葉原ではアニメ・ゲームの原画展や場面写展示、フィギュアの完成見本展示などが各所で開催中。作品の世界をじっくり楽しめる展示を、会場・期間・料金つきでまとめて紹介。入場無料の展示も多いので、買い物ついでに立ち寄ってみよう。"
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
