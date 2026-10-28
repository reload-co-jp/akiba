import SensitiveImg from "components/sensitive-img"
import { jsonLdScript } from "lib/json-ld"
import Link from "next/link"
import AdsenseDisplayAd from "components/adsense-display-ad"
import { notFound } from "next/navigation"
import { absoluteUrl } from "lib/site"
import {
  getEventsForWork,
  getVenueLinksFor,
  hasWorkLanding,
  splitByStatus,
} from "lib/event-landings"
import { EventSection } from "components/event-section"
import { LandingLinks } from "components/event-landing"
import { getSpotByName } from "lib/spots"
import {
  formatDate,
  getAllTags,
  getArticleImage,
  getArticlesByTagId,
  getArticlePublishedDate,
  getTagById,
  getTagColorClass,
  type Tag,
} from "lib/articles"

type Props = {
  params: Promise<{ id: string }>
}

/**
 * Tags that mirror a /spots/gourmet/[cuisine] genre. For these, "イベント
 * 一覧" is the wrong framing — people searching "秋葉原 ラーメン" want
 * shops, not event listings — so metadata and the page body branch to a
 * gourmet-flavored copy and cross-link to the matching cuisine page.
 */
const gourmetTagCuisine: Record<string, string> = {
  ラーメン: "ramen",
  居酒屋: "izakaya",
  バー: "bar",
  寿司: "sushi",
  ケバブ: "kebab",
  イタリアン: "italian",
  メイドカフェ: "maid_cafe",
  中華: "chinese",
  カレー: "curry",
}

const today = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" })

/**
 * 作品タグ（アニメ・ゲーム等）向けの付加情報。「{作品名} 秋葉原」「{作品名} コラボ」
 * 検索の受け皿として、件数・開催状況・会場・FAQを記事データから生成する。
 */
const getWorkInfo = (tag: Tag) => {
  if (tag.kind !== "work") return null
  const articles = getArticlesByTagId(tag.id)
  const events = getEventsForWork(tag)
  const { ongoing, upcoming, past } = splitByStatus(events, today())
  const venues = [...new Set(events.map((a) => a.event.venue))]
  const latest = articles[0]
  const name = tag.name
  const faq: { q: string; a: string }[] = []
  if (events.length > 0) {
    faq.push({
      q: `秋葉原で${name}のイベントは開催中ですか？`,
      a:
        ongoing.length > 0
          ? `現在、『${ongoing[0].title}』など${ongoing.length}件の${name}関連イベントが開催中です（${today().replace(/-/g, "/")}時点）。`
          : upcoming.length > 0
            ? `現在開催中のイベントはありませんが、『${upcoming[0].title}』（${formatDate(upcoming[0].event.startDate)}〜）など${upcoming.length}件が開催予定です。`
            : `現在開催中・開催予定のイベントは掲載していません。これまでに${past.length}件の${name}関連イベントを紹介しており、新しい情報が入り次第このページに追加します。`,
    })
  }
  if (venues.length > 0) {
    faq.push({
      q: `${name}のイベントは秋葉原のどこで開催されていますか？`,
      a: `${venues.slice(0, 5).join("、")}${venues.length > 5 ? `など${venues.length}か所` : ""}で開催実績があります。会場や会期は各記事で確認できます。`,
    })
  }
  faq.push({
    q: `秋葉原の${name}の最新情報は？`,
    a: `最新の記事は『${latest.title}』（${formatDate(latest.publishedAt)}公開）です。このページでは${name}に関するコラボ、ポップアップ、グッズ、展示などのニュースを${articles.length}件まとめています。`,
  })
  return { articles, events, ongoing, upcoming, latest, faq }
}

export const generateStaticParams = () => {
  return getAllTags().map((tag) => ({ id: String(tag.id) }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { id } = await params
  const tag = getTagById(Number(id))
  if (!tag) return {}
  const cuisine = gourmetTagCuisine[tag.name]
  // 同名スポットがあればスポットページを正規URLにしてカニバリを避ける
  const spot = getSpotByName(tag.name)
  // イベント情報は /events/work/[id]/ に寄せ、タグページは記事一覧として差別化
  const work = getWorkInfo(tag)
  const title = cuisine
    ? `秋葉原の${tag.name}情報一覧｜新店舗・ニュース`
    : work
      ? `${tag.name}の秋葉原コラボ・ポップアップ・グッズ情報まとめ`
      : hasWorkLanding(tag.id)
      ? `「${tag.name}」の記事・ニュース一覧｜秋葉原`
      : `秋葉原の${tag.name}イベント一覧｜開催中・予定`
  const description = cuisine
    ? `秋葉原エリアの${tag.name}に関する最新ニュース・新店舗情報をまとめて紹介。実際に行けるお店一覧もあわせて確認できます。`
    : work
      ? `${tag.name}の秋葉原でのコラボカフェ、ポップアップストア、グッズ販売、展示などのニュース${work.articles.length}件を掲載。開催中${work.ongoing.length}件・開催予定${work.upcoming.length}件。最新：${work.latest.title.slice(0, 40)}`
      : `秋葉原の${tag.name}関連イベント・ニュース一覧。開催中、開催予定、ポップアップ、フェア、展示情報をまとめて確認できます。`
  const keywords = work
    ? [
        tag.name,
        ...(tag.nameEn && tag.nameEn !== tag.name ? [tag.nameEn] : []),
        `${tag.name} 秋葉原`,
        `${tag.name} コラボ`,
        `${tag.name} コラボカフェ`,
        `${tag.name} ポップアップ`,
        `${tag.name} グッズ`,
        `${tag.name} イベント`,
        "秋葉原",
      ]
    : cuisine
    ? [
        "秋葉原",
        "神田",
        "アキバ",
        tag.name,
        `秋葉原 ${tag.name}`,
        `神田 ${tag.name}`,
        `${tag.name} 秋葉原 店`,
      ]
    : [
        "秋葉原",
        "神田",
        "アキバ",
        tag.name,
        `秋葉原 ${tag.name}`,
        `神田 ${tag.name}`,
        `${tag.name} イベント`,
        `${tag.name} ポップアップ`,
        `${tag.name} 展示`,
      ]
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: spot ? `/spots/${spot.slug}/` : `/tags/${id}/`,
    },
    openGraph: {
      title: `${title} | アキバLive`,
      description,
      url: `/tags/${id}/`,
      type: "website",
      images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | アキバLive`,
      description,
      images: ["/images/hero.jpg"],
    },
  }
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const tag = getTagById(Number(id))
  if (!tag) notFound()

  const articles = getArticlesByTagId(tag.id)
  const tagUrl = absoluteUrl(`/tags/${id}/`)
  const cuisine = gourmetTagCuisine[tag.name]
  const spot = getSpotByName(tag.name)
  const work = getWorkInfo(tag)
  const activeEvents = work ? [...work.ongoing, ...work.upcoming] : []
  const venueLinks = work ? getVenueLinksFor(work.events) : []

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `「${tag.name}」の記事`,
        item: tagUrl,
      },
    ],
  }

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `秋葉原 ${tag.name} 記事一覧`,
    url: tagUrl,
    ...(work && {
      about: { "@type": "CreativeWork", name: tag.name, alternateName: tag.nameEn },
    }),
    numberOfItems: articles.length,
    itemListElement: articles.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: article.title,
      url: absoluteUrl(`/articles/${article.slug}/`),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListLd) }}
      />
      {work && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: work.faq.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            }),
          }}
        />
      )}
      <section style={{ margin: "0 auto", maxWidth: "1080px" }}>
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <ol
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.25rem",
              listStyle: "none",
              padding: "0",
            }}
          >
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li
              className="breadcrumb__item breadcrumb__item--current"
              aria-current="page"
            >
              「{tag.name}」の記事
            </li>
          </ol>
        </nav>
        <div className="home-articles__header">
          <p className="home-articles__kicker">Tag</p>
          <h1 className="home-articles__title">
            {work ? `${tag.name}の秋葉原ニュース・イベント情報` : `「${tag.name}」の記事`}
          </h1>
        </div>
        {work && (
          <p className="gourmet-lead">
            秋葉原で展開される{tag.name}
            のコラボカフェ、ポップアップストア、グッズ販売、展示などのニュースを
            {work.articles.length}件まとめています（
            <time dateTime={work.latest.publishedAt}>
              {formatDate(work.latest.publishedAt)}
            </time>
            更新）。
          </p>
        )}
        {cuisine && (
          <p className="gourmet-lead">
            秋葉原で{tag.name}のお店を探すなら、
            <Link href={`/spots/gourmet/${cuisine}/`}>
              秋葉原の{tag.name}一覧
            </Link>
            もあわせてチェック。
          </p>
        )}
        {spot && (
          <p className="gourmet-lead">
            アクセスや開催イベントは
            <Link href={`/spots/${spot.slug}/`}>{spot.name}のスポット情報</Link>
            をチェック。
          </p>
        )}
        {hasWorkLanding(tag.id) && (
          <p className="gourmet-lead">
            開催中・開催予定のイベントは
            <Link href={`/events/work/${tag.id}/`}>
              秋葉原の{tag.name}イベント情報
            </Link>
            にまとめています。
          </p>
        )}
        <AdsenseDisplayAd />

        {activeEvents.length > 0 && (
          <EventSection
            id="active-events-heading"
            kicker="Now & Upcoming"
            title={`開催中・開催予定の${tag.name}イベント`}
          >
            <ul>
              {activeEvents.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}/`}>{a.title}</Link>（
                  {a.event.venue}／{formatDate(a.event.startDate)}〜
                  {formatDate(a.event.endDate)}）
                </li>
              ))}
            </ul>
          </EventSection>
        )}

        <ul className="article-list">
          {articles.map((article) => {
            const image = getArticleImage(article)
            return (
              <li key={article.id}>
                <Link
                  href={`/articles/${article.slug}/`}
                  className="article-card-link"
                >
                  <article className="article-card">
                    <SensitiveImg
              sensitive={image.sensitive}
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      className="article-card__image"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="article-card__body">
                      <div className="article-card__tags">
                        {article.tagIds.map((tid) => {
                          const t = getTagById(tid)
                          return t ? (
                            <span
                              key={tid}
                              className={`article-card__tag ${getTagColorClass(t.name)}`}
                            >
                              {t.name}
                            </span>
                          ) : null
                        })}
                      </div>
                      <h2 className="article-card__title">{article.title}</h2>
                      <p className="article-card__summary">{article.summary}</p>
                      <time
                        className="article-card__date"
                        dateTime={getArticlePublishedDate(
                          article
                        ).toISOString()}
                      >
                        {formatDate(article.publishedAt)}
                      </time>
                    </div>
                  </article>
                </Link>
              </li>
            )
          })}
        </ul>

        {venueLinks.length > 0 && (
          <EventSection
            id="venues-heading"
            kicker="Venues"
            title={`${tag.name}のイベント開催会場`}
          >
            <LandingLinks items={venueLinks} />
          </EventSection>
        )}
        {work && (
          <EventSection
            id="faq-heading"
            kicker="FAQ"
            title={`秋葉原の${tag.name}に関するよくある質問`}
          >
            <dl>
              {work.faq.map(({ q, a }) => (
                <div key={q}>
                  <dt style={{ fontWeight: "700", marginTop: "1rem" }}>Q. {q}</dt>
                  <dd style={{ margin: "0.25rem 0 0" }}>A. {a}</dd>
                </div>
              ))}
            </dl>
          </EventSection>
        )}
      </section>
    </>
  )
}

export default Page
