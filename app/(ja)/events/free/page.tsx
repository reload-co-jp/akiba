import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import {
  getEventsMatching,
  landingDescriptionSuffix,
  landingMetadata,
} from "lib/event-landings"

const FREE_TAG_ID = 198
const FREE_PRICE = /^(入場|参加|来場|入店)?無料/
const path = "/events/free/"
const description =
  "秋葉原で入場無料・参加無料のイベントを一覧で紹介。ポップアップストア・展示・体験イベント・フェアなど、無料で楽しめる開催中・開催予定のイベントを会場・期間・公式リンク付きで確認できます。"
const events = getEventsMatching(
  (a) => a.tagIds.includes(FREE_TAG_ID) || FREE_PRICE.test(a.event?.price ?? "")
)

export const metadata = landingMetadata(
  path,
  "秋葉原の無料イベント一覧【開催中・予定】",
  description + landingDescriptionSuffix(events),
  [
    "秋葉原 無料イベント",
    "秋葉原 無料",
    "秋葉原 入場無料",
    "秋葉原 イベント 無料",
  ]
)

const Page = () => (
  <EventLanding
    path={path}
    title="秋葉原の無料イベント一覧"
    kicker="Free Events in Akihabara"
    breadcrumbLabel="無料イベント特集"
    description={description}
    about={{ "@type": "Thing", name: "無料イベント" }}
    lead="秋葉原にはポップアップストアや展示、体験イベントなど、入場無料で楽しめるイベントがたくさん。チケット不要でふらっと立ち寄れるイベントを、会場・期間・料金条件つきでまとめて紹介。グッズ購入や飲食は別料金の場合もあるので、詳細は各記事でチェックしよう。"
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
