import { getAllArticles } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { Breadcrumb } from "components/breadcrumb"
import { CalendarView } from "./calendar-view"

const TITLE = "秋葉原のイベントカレンダー｜月別開催スケジュール一覧"
const DESCRIPTION =
  "秋葉原で開催されるアニメ・ゲーム・コラボカフェ・POPUPストアなどのイベントを月別カレンダーで確認。日付ごとの開催イベント一覧をまとめて掲載。"

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/events/calendar/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/events/calendar/",
    type: "website",
  },
}

const Page = () => {
  const events = getAllArticles().filter((a) => a.event != null)
  const pageUrl = absoluteUrl("/events/calendar/")
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
      { "@type": "ListItem", position: 3, name: "イベントカレンダー", item: pageUrl },
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "イベント", href: "/events/" },
          { label: "イベントカレンダー" },
        ]}
      />
      <CalendarView events={events} />
    </>
  )
}

export default Page
