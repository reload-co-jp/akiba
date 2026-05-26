import Link from "next/link"
import { getAllArticles, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"

const COLLAB_CAFE_TAG_IDS = [81, 57, 131, 82]

export const metadata = {
  title: "秋葉原のコラボカフェ情報【開催中・予定】アニメ・ゲームコラボまとめ",
  description:
    "秋葉原で開催中・開催予定のコラボカフェを一覧で紹介。アニメ・ゲームキャラクターとのコラボカフェや期間限定メニューの情報を会場・期間付きで確認できます。",
  alternates: { canonical: "/events/collab-cafe/" },
  openGraph: {
    title: "秋葉原のコラボカフェ情報【開催中・予定】アニメ・ゲームコラボまとめ",
    description:
      "秋葉原で開催中・開催予定のコラボカフェを一覧で紹介。アニメ・ゲームキャラクターとのコラボカフェや期間限定メニューの情報を会場・期間付きで確認できます。",
    url: "/events/collab-cafe/",
    type: "website",
  },
}

const fmtRange = (s: string, e: string) =>
  `${s.slice(5).replace("-", "/")} 〜 ${e.slice(5).replace("-", "/")}`

const Page = () => {
  const today = new Date().toISOString().slice(0, 10)

  const allCollabCafe = getAllArticles().filter(
    (a) => a.event && a.tagIds.some((tid) => COLLAB_CAFE_TAG_IDS.includes(tid)),
  )

  const ongoing = allCollabCafe.filter(
    (a) => a.event!.startDate <= today && a.event!.endDate >= today,
  )
  const upcoming = allCollabCafe.filter((a) => a.event!.startDate > today)

  const pageUrl = absoluteUrl("/events/collab-cafe/")

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "コラボカフェ特集", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      url: pageUrl,
      name: "秋葉原のコラボカフェ情報【開催中・予定】",
      description:
        "秋葉原で開催中・開催予定のコラボカフェを一覧で紹介。アニメ・ゲームキャラクターとのコラボカフェや期間限定メニューの情報を会場・期間付きで確認できます。",
      inLanguage: "ja",
    },
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
            <li className="breadcrumb__item breadcrumb__item--current">コラボカフェ特集</li>
          </ol>
        </nav>

        <header className="events-page__header">
          <p className="events-page__kicker">Collab Cafe in Akihabara</p>
          <h1 className="events-page__title">秋葉原のコラボカフェ情報【開催中・予定】</h1>
        </header>

        <p className="today-lead">
          秋葉原ではアニメ・ゲームとのコラボカフェが常時複数開催されています。
          限定メニューや特典グッズを楽しめる期間限定カフェを開催中・開催予定にわけてまとめました。
        </p>

        <section className="today-section" aria-labelledby="ongoing-heading">
          <div className="today-section__header">
            <p className="today-section__kicker">Ongoing</p>
            <h2 id="ongoing-heading" className="today-section__title">
              開催中のコラボカフェ（{ongoing.length}件）
            </h2>
          </div>
          {ongoing.length === 0 ? (
            <p className="events-page__empty">現在開催中のコラボカフェはありません。</p>
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
                        <h2 className="events-card__title">{a.title}</h2>
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
              開催予定のコラボカフェ（{upcoming.length}件）
            </h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="events-page__empty">開催予定のコラボカフェはありません。</p>
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
              <Link href="/events/popup/" className="today-related__link">
                POPUPストア特集 →
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
