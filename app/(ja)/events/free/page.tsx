import AdsenseDisplayAd from "components/adsense-display-ad"
import { EventLanding } from "components/event-landing"
import { EventSection } from "components/event-section"
import { jsonLdScript } from "lib/json-ld"
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
    "秋葉原 無料 イベント",
    "秋葉原 無料",
    "秋葉原 入場無料",
    "秋葉原 イベント 無料",
  ]
)

const FAQ = [
  {
    q: "秋葉原で無料で楽しめるイベントにはどんなものがありますか？",
    a: "アニメ・ゲーム作品のポップアップストアや原画・パネル展示、企業の体験イベント、フェアなどが入場無料で開催されることが多いです。グッズ購入や飲食、一部の体験は別料金の場合があるため、各イベントの料金条件を確認してください。",
  },
  {
    q: "無料イベントに予約や整理券は必要ですか？",
    a: "多くは予約不要で自由に入場できますが、初日や人気作品のイベントでは事前予約制・整理券配布・入場抽選になる場合があります。最新の入場方法は各記事に掲載の公式サイトで確認してください。",
  },
  {
    q: "秋葉原で無料イベントが多い会場はどこですか？",
    a: "秋葉原UDXのアキバ・スクエアやベルサール秋葉原などのイベントスペース、アニメ・ホビー系ショップの催事スペースで無料の展示やポップアップが頻繁に開催されています。会場ごとの一覧は会場別イベントページから確認できます。",
  },
  {
    q: "今日行ける秋葉原の無料イベントを探すには？",
    a: "このページの「開催中」の一覧に、現在開催されている無料イベントをまとめています。日付で絞り込みたい場合は「今日のイベント」「今週のイベント」ページも活用してください。",
  },
]

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
      { href: "/events/venue/", label: "会場別イベント" },
    ]}
    showMap
    pastLimit={12}
  >
    <AdsenseDisplayAd />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: jsonLdScript({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(({ q, a }) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }),
      }}
    />
    <EventSection
      id="faq-heading"
      kicker="FAQ"
      title="秋葉原の無料イベントに関するよくある質問"
    >
      <dl>
        {FAQ.map(({ q, a }) => (
          <div key={q}>
            <dt style={{ fontWeight: "700", marginTop: "1rem" }}>Q. {q}</dt>
            <dd style={{ margin: "0.25rem 0 0" }}>A. {a}</dd>
          </div>
        ))}
      </dl>
    </EventSection>
  </EventLanding>
)

export default Page
