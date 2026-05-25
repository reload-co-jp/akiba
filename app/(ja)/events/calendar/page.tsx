import { getAllArticles } from "lib/articles"
import { CalendarView } from "./calendar-view"

export const metadata = {
  title: "イベントカレンダー",
  description: "秋葉原で開催されるイベントのカレンダー表示",
  alternates: { canonical: "/events/calendar/" },
  openGraph: {
    title: "イベントカレンダー | アキバLive",
    description: "秋葉原で開催されるイベントのカレンダー表示",
    url: "/events/calendar/",
    type: "website",
  },
}

const Page = () => {
  const events = getAllArticles().filter((a) => a.event != null)
  return <CalendarView events={events} />
}

export default Page
