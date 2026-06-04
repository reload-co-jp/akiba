import Link from "next/link"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"

const POPUP_TAG_IDS = [17, 128, 129, 196, 54, 62]

export const metadata = {
  title: "秋葉原のポップアップストア情報【開催中・予定】期間限定ショップまとめ",
  description:
    "秋葉原で開催中・開催予定のポップアップストアを一覧で紹介。アニメ・ゲーム・キャラクターの期間限定ショップやPOPUP情報を会場・期間付きで確認できます。",
  alternates: { canonical: "/events/popup/" },
  openGraph: {
    title: "秋葉原のポップアップストア情報【開催中・予定】期間限定ショップまとめ",
    description:
      "秋葉原で開催中・開催予定のポップアップストアを一覧で紹介。アニメ・ゲーム・キャラクターの期間限定ショップやPOPUP情報を会場・期間付きで確認できます。",
    url: "/events/popup/",
    type: "website",
  },
}

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} 〜 ${e.slice(5).replace("-", "/")}`

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)

  const allPopup = getAllArticles().filter(
    (a) => a.event && a.tagIds.some((tid) => POPUP_TAG_IDS.includes(tid)),
  )

  const ongoing = allPopup.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today,
  )
  const upcoming = allPopup.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/events/popup/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "POPUPストア特集", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原のポップアップストア情報【開催中・予定】",
      description:
        "秋葉原で開催中・開催予定のポップアップストアを一覧で紹介。アニメ・ゲーム・キャラクターの期間限定ショップやPOPUP情報を会場・期間付きで確認できます。",
      inLanguage: "ja",
    },
    ...(ongoing.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "開催中のポップアップストア一覧",
            url: pageUrl,
            numberOfItems: ongoing.length,
            itemListElement: ongoing.slice(0, 10).map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: a.title,
              url: absoluteUrl(`/articles/${a.slug}/`),
            })),
          },
        ]
      : []),
    ...ongoing.slice(0, 5).map((a) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: a.title,
      startDate: a.event!.startDate,
      endDate: a.event!.endDate,
      url: absoluteUrl(`/articles/${a.slug}/`),
      location: {
        "@type": "Place",
        name: a.event!.venue,
        address: {
          "@type": "PostalAddress",
          addressLocality: "秋葉原",
          addressRegion: "東京都",
          addressCountry: "JP",
        },
      },
    })),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="events-page">
        <nav className="breadcrumb" aria-label="パンくずリスト">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/events/">イベント</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current">POPUPストア特集</li>
          </ol>
        </nav>

        <header className="events-page__header">
          <p className="events-page__kicker">Popup Store in Akihabara</p>
          <h1 className="events-page__title">秋葉原のポップアップストア情報【開催中・予定】</h1>
        </header>

        <p className="today-lead">
          秋葉原ではアニメ・ゲーム・アイドルなどのキャラクターをテーマにした期間限定ポップアップストアが常時開催されています。
          限定グッズ販売・描き下ろしビジュアル・サイン入り特典など、会場でしか手に入らないアイテムを会場・開催期間付きで紹介します。
          開催中のPOPUPストアをまとめてチェックして、推しのイベントを見逃さないようにしましょう。
        </p>

        <section className="today-section" aria-labelledby="ongoing-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ongoing</p>
            <h2 id="ongoing-heading" className="today-section__title">
              開催中のポップアップストア（{ongoing.length}件）
            </h2>
          </div>
          {ongoing.length === 0 ? (
            <p className="events-page__empty">現在開催中のポップアップストアはありません。</p>
          ) : (
            <ul className="events-list">
              {ongoing.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}/`} className="events-card-link">
                    <article className="events-card events-card--with-image">
                      <img
                        className="events-card__image"
                        src={getArticleImage(a).src}
                        alt={getArticleImage(a).alt}
                      />
                      <div>
                        <h3 className="events-card__title">{a.title}</h3>
                        <dl className="events-card__meta">
                          <dt>会場</dt>
                          <dd>{a.event!.venue}</dd>
                          <dt>期間</dt>
                          <dd>{fmtRange(a.event!.startDate, a.event!.endDate)}</dd>
                          <dt>料金</dt>
                          <dd>{a.event!.price}</dd>
                        </dl>
                      </div>
                    </article>
                  </Link>
                  {a.sources?.[0]?.url && (
                    <a
                      href={a.sources[0].url}
                      className="today-official-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ↗ {a.sources[0].label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="today-section" aria-labelledby="upcoming-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Upcoming</p>
            <h2 id="upcoming-heading" className="today-section__title">
              開催予定のポップアップストア（{upcoming.length}件）
            </h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="events-page__empty">開催予定のポップアップストアはありません。</p>
          ) : (
            <ul className="cal__list">
              {upcoming.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}/`} className="cal__list-item">
                    <img
                      className="cal__list-image"
                      src={getArticleImage(a).src}
                      alt={getArticleImage(a).alt}
                    />
                    <time className="cal__list-date" dateTime={a.event!.startDate}>
                      {a.event!.startDate.slice(5).replace("-", "/")} 〜
                    </time>
                    <span className="cal__list-title">{a.title}</span>
                    <span className="cal__list-venue">{a.event!.venue}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="today-section" aria-labelledby="related-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Related</p>
            <h2 id="related-heading" className="today-section__title">
              関連リンク
            </h2>
          </div>
          <ul className="today-related">
            <li>
              <Link href="/events/today/" className="today-related__link">
                今日のイベント →
              </Link>
            </li>
            <li>
              <Link href="/events/this-week/" className="today-related__link">
                今週のイベント →
              </Link>
            </li>
            <li>
              <Link href="/events/collab-cafe/" className="today-related__link">
                コラボカフェ特集 →
              </Link>
            </li>
            <li>
              <Link href="/events/" className="today-related__link">
                開催中イベント一覧 →
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </>
  )
}

export default Page
