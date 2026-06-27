import Link from "next/link"
import {
  getOngoingEvents,
  getEndingSoonEvents,
  getUpcomingThisWeekEvents,
  getTopVenues,
  getAllTagsData,
  getArticleImage,
} from "lib/articles"
import { absoluteUrl, siteName } from "lib/site"
import { Breadcrumb } from "components/breadcrumb"
import { EventSection } from "components/event-section"
import { CalListItem } from "components/cal-list-item"
import { TodayVenueFilter } from "components/today-venue-filter"
import { TodayCategoryFilter } from "components/today-category-filter"


const CATEGORY_GROUPS: Array<{ id: string; name: string; tagIds: number[] }> = [
  { id: "anime", name: "アニメ・漫画", tagIds: [47, 49, 78, 79, 203] },
  { id: "game", name: "ゲーム・トレカ", tagIds: [74, 75, 100, 104] },
  { id: "collab-cafe", name: "コラボカフェ", tagIds: [81, 57, 131, 82] },
  { id: "popup", name: "ポップアップ・限定ショップ", tagIds: [17, 128, 129, 196, 54] },
  { id: "hobby", name: "ホビー・フィギュア", tagIds: [126, 113, 119, 127] },
  { id: "voice-idol", name: "声優・アイドル", tagIds: [167, 168, 42, 146] },
  { id: "exhibition", name: "展示・アート", tagIds: [177, 178, 179, 130, 200] },
  { id: "conference", name: "テクノロジー・カンファレンス", tagIds: [60, 109, 122, 201] },
]

const FAQ_ITEMS = [
  {
    q: "今日開催中の秋葉原イベントを一覧で確認できますか？",
    a: "このページ上部の「今日開催の秋葉原イベント一覧」から、本日開催中のイベントをすべて確認できます。会場ボタンで絞り込みも可能です。",
  },
  {
    q: "イベントの詳細（料金・公式サイト）はどこで確認できますか？",
    a: "各イベントのタイトルをクリックすると詳細ページに移動します。会場・期間・料金・公式リンクを掲載しています。",
  },
  {
    q: "会場ごとにイベントを絞り込めますか？",
    a: "「今日開催の秋葉原イベント一覧」の「会場で絞り込む」ボタンから特定会場のイベントだけ表示できます。",
  },
  {
    q: "終了間近のイベントはどこで確認できますか？",
    a: "「終了間近のイベント」セクションに3日以内に終了するイベントをまとめています。見逃し防止にご活用ください。",
  },
  {
    q: "秋葉原の定番イベント会場を知りたい",
    a: "「よく使われる会場一覧」セクションに開催実績の多い会場を掲載しています。AKIHABARAゲーマーズ本店・書泉ブックタワー・ベルサール秋葉原・秋葉原UDXなどが主要会場です。",
  },
  {
    q: "秋葉原で今日開催されているアニメイベントは何ですか？",
    a: "ページ内「カテゴリ別イベント」の「アニメ・漫画」タブから、本日開催中のアニメ・漫画関連イベントを絞り込んで確認できます。",
  },
  {
    q: "今日の秋葉原でコラボカフェはやっていますか？",
    a: "「カテゴリ別イベント」の「コラボカフェ」タブで本日開催中のコラボカフェを一覧表示できます。詳細ページで予約方法や料金も確認できます。",
  },
  {
    q: "今日行ける秋葉原のポップアップショップを知りたい",
    a: "「カテゴリ別イベント」の「ポップアップ・限定ショップ」タブから、本日開催中のポップアップストアや期間限定ショップを確認できます。",
  },
  {
    q: "秋葉原イベントの開催情報はいつ更新されますか？",
    a: "新しいイベント情報が入り次第、随時更新しています。開催期間・会場・料金を正確に掲載するよう努めていますが、変更の場合は各公式サイトをご確認ください。",
  },
  {
    q: "今週末に秋葉原で開催されるイベントを調べたい",
    a: "「今週開催予定のイベント」セクションか、「今週の秋葉原イベント」ページで週末のイベントをまとめて確認できます。",
  },
  {
    q: "秋葉原イベントへのアクセス方法は？",
    a: "秋葉原へはJR秋葉原駅・東京メトロ日比谷線秋葉原駅・つくばエクスプレス秋葉原駅が最寄りです。各イベント詳細ページに会場住所を掲載しています。",
  },
]


export const generateMetadata = () => {
  const today = new Date().toISOString().slice(0, 10)
  const [, month, day] = today.split("-")
  const dateLabel = `${parseInt(month)}月${parseInt(day)}日`
  const ongoingCount = getOngoingEvents(today).length
  const title = `秋葉原イベント【${dateLabel}開催中${ongoingCount}件】アニメ・ゲーム・コラボカフェ・POPUPまとめ`
  const description = `${dateLabel}に秋葉原で開催中のイベントを一覧で紹介。アニメ・漫画、ゲーム・トレカ、コラボカフェ、ポップアップストア、声優・アイドル、ホビー・フィギュアなど${ongoingCount}件を会場・期間・公式リンク付きで確認できます。AKIHABARAゲーマーズ・書泉ブックタワー・アトレ秋葉原など主要会場別にも絞り込み可能。`
  return {
    title,
    description,
    alternates: { canonical: "/events/today/" },
    openGraph: {
      title,
      description,
      url: "/events/today/",
      type: "website",
    },
  }
}

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)
  const [year, month, day] = today.split("-")
  const todayLabel = `${year}年${parseInt(month)}月${parseInt(day)}日`

  const ongoingEvents = getOngoingEvents(today)
  const endingSoonEvents = getEndingSoonEvents(today, 3)
  const upcomingEvents = getUpcomingThisWeekEvents(today, 7)
  const topVenues = getTopVenues(15)
  const tagMap = Object.fromEntries(getAllTagsData().map((t) => [t.id, t.name])) as Record<
    number,
    string
  >

  const venueFilterEvents = ongoingEvents.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    image: a.image,
    tags: a.tagIds.flatMap((tid) => (tagMap[tid] ? [tagMap[tid]] : [])),
    event: {
      venue: a.event!.venue,
      startDate: a.event!.startDate,
      endDate: a.event!.endDate,
      price: a.event!.price,
    },
    sourceUrl: a.sources?.[0]?.url,
    sourceLabel: a.sources?.[0]?.label,
  }))

  const categorized = CATEGORY_GROUPS.map((group) => ({
    id: group.id,
    name: group.name,
    events: ongoingEvents
      .filter((e) => e.tagIds.some((id) => group.tagIds.includes(id)))
      .map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        image: a.image,
        event: {
          venue: a.event!.venue,
          startDate: a.event!.startDate,
          endDate: a.event!.endDate,
        },
      })),
  })).filter((g) => g.events.length > 0)

  const pageUrl = absoluteUrl("/events/today/")

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
      { "@type": "ListItem", position: 3, name: "今日のイベント", item: pageUrl },
    ],
  }

  const firstImage = ongoingEvents[0] ? absoluteUrl(getArticleImage(ongoingEvents[0]).src) : undefined

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    url: pageUrl,
    name: "秋葉原のイベント情報【今日開催】",
    description:
      "今日開催中の秋葉原イベントを一覧で紹介。アニメ、ゲーム、コラボカフェ、POPUP、ホビー、PC関連イベントを開催場所・期間・公式リンク付きで確認できます。",
    dateModified: today,
    inLanguage: "ja",
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    publisher: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
    ...(firstImage ? { image: firstImage } : {}),
    about: {
      "@type": "Place",
      name: "秋葉原",
      address: {
        "@type": "PostalAddress",
        addressLocality: "秋葉原",
        addressRegion: "東京都",
        addressCountry: "JP",
      },
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".today-lead", ".today-section__title"],
    },
  }

  const eventJsonLds = ongoingEvents.slice(0, 10).map((a) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: a.title,
    description: a.summary,
    startDate: a.event!.startDate,
    endDate: a.event!.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(`/articles/${a.slug}/`),
    image: absoluteUrl(getArticleImage(a).src),
    location: {
      "@type": "Place",
      name: a.event!.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: a.event!.venue,
        addressLocality: "千代田区外神田",
        addressRegion: "東京都",
        addressCountry: "JP",
      },
    },
    organizer: { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
    performer: a.event!.performer
      ? { "@type": "PerformingGroup", name: a.event!.performer }
      : { "@type": "Organization", name: siteName, url: absoluteUrl("/") },
    ...(a.event!.price === "無料"
      ? { offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" } }
      : {}),
  }))

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbJsonLd,
            collectionPageJsonLd,
            faqJsonLd,
            ...eventJsonLds,
          ]),
        }}
      />

      <div className="events-page">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "イベント", href: "/events/" },
            { label: "今日のイベント" },
          ]}
        />

        <header className="events-page__header">
          <p className="events-page__kicker">Today&apos;s Events in Akihabara</p>
          <h1 className="events-page__title">秋葉原のイベント情報【今日開催】</h1>
          <p className="today-updated">
            {todayLabel} 現在 · {ongoingEvents.length}件開催中
          </p>
        </header>

        <p className="today-lead">
          秋葉原では毎日、アニメ・漫画、ゲーム・トレカ、コラボカフェ、ポップアップストア、声優・アイドルイベント、ホビー・フィギュアの展示販売など多彩なイベントが開催されています。
          このページでは{todayLabel}に開催中のイベントを会場・カテゴリ別にまとめています。
          AKIHABARAゲーマーズ本店・書泉ブックタワー・アニメイト秋葉原・ベルサール秋葉原・アトレ秋葉原など主要会場別に絞り込み可能。
          公式リンクと開催期間を確認して、おでかけの参考にしてください。
        </p>

        <EventSection id="today-events-heading" kicker="Ongoing Today" title="今日開催の秋葉原イベント一覧">
          <TodayVenueFilter
            events={venueFilterEvents}
            hrefPrefix="/articles/"
            locale="ja"
          />
        </EventSection>

        <EventSection id="category-heading" kicker="By Category" title="カテゴリ別イベント">
          <TodayCategoryFilter
            groups={categorized}
            hrefPrefix="/articles/"
            locale="ja"
          />
        </EventSection>

        <EventSection id="ending-soon-heading" kicker="Ending Soon" title="終了間近のイベント">
          {endingSoonEvents.length === 0 ? (
            <p className="events-page__empty">3日以内に終了するイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {endingSoonEvents.map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.endDate}
                  dateLabel={`〜${a.event!.endDate.slice(5).replace("-", "/")}`}
                  title={a.title}
                  venue={a.event!.venue}
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection id="upcoming-heading" kicker="Coming This Week" title="今週開催予定のイベント">
          {upcomingEvents.length === 0 ? (
            <p className="events-page__empty">今週開始予定のイベントはありません。</p>
          ) : (
            <ul className="cal__list">
              {upcomingEvents.map((a) => (
                <CalListItem
                  key={a.id}
                  href={`/articles/${a.slug}/`}
                  image={getArticleImage(a)}
                  dateTime={a.event!.startDate}
                  dateLabel={`${a.event!.startDate.slice(5).replace("-", "/")} 〜`}
                  title={a.title}
                  venue={a.event!.venue}
                />
              ))}
            </ul>
          )}
        </EventSection>

        <EventSection id="venues-heading" kicker="Popular Venues" title="よく使われる会場一覧">
          <ul className="today-venues-grid" aria-label="秋葉原のイベント会場一覧">
            {topVenues.map(({ venue }) => (
              <li key={venue} className="today-venues-grid__item">
                {venue}
              </li>
            ))}
          </ul>
        </EventSection>

        <EventSection id="faq-heading" kicker="FAQ" title="よくある質問">
          <ul className="today-faq">
            {FAQ_ITEMS.map(({ q, a }) => (
              <li key={q} className="today-faq__item">
                <p className="today-faq__question">Q. {q}</p>
                <p className="today-faq__answer">A. {a}</p>
              </li>
            ))}
          </ul>
        </EventSection>

        <EventSection id="related-heading" kicker="Related" title="関連リンク">
          <ul className="today-related">
            <li>
              <Link href="/events/this-week/" className="today-related__link">
                今週の秋葉原イベント →
              </Link>
            </li>
            <li>
              <Link href="/events/monthly/" className="today-related__link">
                月別イベントカレンダー →
              </Link>
            </li>
            <li>
              <Link href="/events/collab-cafe/" className="today-related__link">
                コラボカフェ特集 →
              </Link>
            </li>
            <li>
              <Link href="/events/popup/" className="today-related__link">
                POPUPストア特集 →
              </Link>
            </li>
            <li>
              <Link href="/events/" className="today-related__link">
                開催中イベント一覧 →
              </Link>
            </li>
            <li>
              <Link href="/events/calendar/" className="today-related__link">
                イベントカレンダー →
              </Link>
            </li>
          </ul>
        </EventSection>
      </div>
    </>
  )
}

export default Page
