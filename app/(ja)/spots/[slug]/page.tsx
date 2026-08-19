import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getAllSpotSlugs,
  getSpotBySlug,
  getSpotImage,
  getSpotSeoKeywords,
  getSpotHeadline,
  getSpotsByCategory,
} from "lib/spots"
import { getArticlesBySpotName, formatDate, getArticleImage } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import AdsenseFluidAd from "components/adsense-fluid-ad"
import { ArticleVenueMap } from "components/article-venue-map"
import { EditorCommentBlock } from "components/editor-comment"

type Props = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () =>
  getAllSpotSlugs().map((slug) => ({ slug }))

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params
  const spot = getSpotBySlug(slug)
  if (!spot) return {}
  const image = getSpotImage(spot)
  const keywords = getSpotSeoKeywords(spot)
  const { title: seoTitle, description } = getSpotHeadline(spot)
  return {
    title: seoTitle,
    description,
    keywords,
    alternates: { canonical: `/spots/${slug}/` },
    openGraph: {
      title: seoTitle,
      description,
      url: `/spots/${slug}/`,
      images: [{ url: image.src, alt: image.alt }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: [image.src],
    },
  }
}

const Page = async ({ params }: Props) => {
  const { slug } = await params
  const spot = getSpotBySlug(slug)
  if (!spot) notFound()

  const spotUrl = absoluteUrl(`/spots/${slug}/`)
  const spotImage = getSpotImage(spot)
  const relatedArticles = getArticlesBySpotName(spot.name, spot.aliases).slice(0, 10)
  const spotKeywords = getSpotSeoKeywords(spot)
  const otherCategorySpots = getSpotsByCategory(spot.category)
    .filter((s) => s.slug !== spot.slug)
    .slice(0, 8)

  // Restaurant is a subtype of LocalBusiness, so eating places get the richer
  // type (servesCuisine / priceRange) without losing the generic properties.
  const isEatery = spot.category === "グルメ・カフェ"

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isEatery
      ? ["Restaurant", "Place", "LocalBusiness"]
      : ["TouristAttraction", "Place", "LocalBusiness"],
    "@id": `${spotUrl}#place`,
    name: spot.name,
    description: spot.description,
    url: spotUrl,
    keywords: spotKeywords.join(", "),
    category: spot.category,
    address: {
      "@type": "PostalAddress",
      ...(spot.address ? { streetAddress: spot.address } : {}),
      addressLocality: "千代田区",
      addressRegion: "東京都",
      addressCountry: "JP",
    },
    areaServed: [
      { "@type": "Place", name: "秋葉原" },
      { "@type": "Place", name: "神田" },
      { "@type": "Place", name: "末広町" },
    ],
    ...(spot.hours ? { openingHours: spot.hours } : {}),
    ...(isEatery && spot.cuisine?.length
      ? { servesCuisine: spot.cuisine }
      : {}),
    ...(spot.priceRange ? { priceRange: spot.priceRange } : {}),
    publicAccess: true,
    isAccessibleForFree: spot.admission === "無料" || spot.admission == null,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: spot.category, value: true },
      ...(spot.tags ?? []).map((tag) => ({
        "@type": "LocationFeatureSpecification",
        name: tag,
        value: true,
      })),
    ],
    ...(spot.lat && spot.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: spot.lat,
            longitude: spot.lng,
          },
        }
      : {}),
    ...(spot.website ? { sameAs: spot.website } : {}),
    image: {
      "@type": "ImageObject",
      url: absoluteUrl(spotImage.src),
      ...(spotImage.width && { width: spotImage.width }),
      ...(spotImage.height && { height: spotImage.height }),
    },
    subjectOf: relatedArticles.map((article, i) => ({
      "@type": article.event ? "Event" : "NewsArticle",
      position: i + 1,
      name: article.title,
      url: absoluteUrl(`/articles/${article.slug}/`),
      ...(article.event
        ? {
            startDate: article.event.startDate,
            endDate: article.event.endDate,
          }
        : {}),
    })),
  }

  const relatedEventsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${spot.name}の関連イベント・ニュース`,
    url: spotUrl,
    numberOfItems: relatedArticles.length,
    itemListElement: relatedArticles.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: article.title,
      url: absoluteUrl(`/articles/${article.slug}/`),
    })),
  }

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
        name: "観光スポット",
        item: absoluteUrl("/spots/"),
      },
      { "@type": "ListItem", position: 3, name: spot.name, item: spotUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([jsonLd, relatedEventsLd]) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />
      <article
        style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem 0" }}
      >
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li className="breadcrumb__item">
              <Link href="/spots/">観光スポット</Link>
            </li>
            <li
              className="breadcrumb__item breadcrumb__item--current"
              aria-current="page"
            >
              {spot.name}
            </li>
          </ol>
        </nav>

        <div
          style={{
            display: "flex",
            gap: ".5rem",
            flexWrap: "wrap",
            marginBottom: ".75rem",
          }}
        >
          <span className="article-tag">{spot.category}</span>
          {spot.tags?.map((tag) => (
            <span key={tag} className="article-tag">
              {tag}
            </span>
          ))}
        </div>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#24312f",
            margin: "0 0 1.5rem",
            lineHeight: "1.4",
          }}
        >
          {getSpotHeadline(spot).heading}
        </h1>

        <figure className="article-hero-image">
          <img
            src={spotImage.src}
            alt={spotImage.alt}
            width={spotImage.width}
            height={spotImage.height}
            fetchPriority="high"
            decoding="async"
          />
          {spot.image?.sourceLabel && (
            <figcaption>
              画像:&nbsp;
              {spot.image.sourceUrl ? (
                <a
                  href={spot.image.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {spot.image.sourceLabel}
                </a>
              ) : (
                spot.image.sourceLabel
              )}
            </figcaption>
          )}
        </figure>

        <div
          style={{
            backgroundColor: "#fffdf8",
            border: "1px solid rgba(96, 120, 111, 0.14)",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1.5rem",
            fontSize: ".875rem",
          }}
        >
          <h2
            style={{
              fontSize: ".875rem",
              fontWeight: "bold",
              color: "#b94a3a",
              margin: "0 0 .75rem",
            }}
          >
            スポット情報
          </h2>
          <dl
            style={{
              margin: 0,
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: ".25rem .75rem",
            }}
          >
            {spot.address && (
              <>
                <dt style={{ color: "#8a6f63" }}>住所</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>{spot.address}</dd>
              </>
            )}
            {spot.access && (
              <>
                <dt style={{ color: "#8a6f63" }}>アクセス</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>{spot.access}</dd>
              </>
            )}
            {spot.hours && (
              <>
                <dt style={{ color: "#8a6f63" }}>営業時間</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>{spot.hours}</dd>
              </>
            )}
            {spot.closed && (
              <>
                <dt style={{ color: "#8a6f63" }}>定休日</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>{spot.closed}</dd>
              </>
            )}
            {spot.admission && (
              <>
                <dt style={{ color: "#8a6f63" }}>料金</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>
                  {spot.admission}
                </dd>
              </>
            )}
            {spot.website && (
              <>
                <dt style={{ color: "#8a6f63" }}>公式サイト</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>
                  <a
                    href={spot.website}
                    rel="noopener noreferrer"
                    target="_blank"
                    style={{ color: "#b94a3a" }}
                  >
                    {spot.website}
                  </a>
                </dd>
              </>
            )}
          </dl>
        </div>

        {spot.lat && spot.lng && (
          <div style={{ marginBottom: "1.5rem" }}>
            <ArticleVenueMap
              venue={spot.name}
              lat={spot.lat}
              lng={spot.lng}
              query={spot.address ? `${spot.name} ${spot.address}` : `${spot.name} 秋葉原`}
            />
          </div>
        )}

        <div className="article-content">
          <p>{spot.description}</p>
        </div>

        {spot.editorComment && <EditorCommentBlock comment={spot.editorComment} />}

        <AdsenseFluidAd />

        {relatedArticles.length > 0 && (
          <section aria-labelledby="spot-events-title" style={{ marginTop: "2rem" }}>
            <h2
              id="spot-events-title"
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#b94a3a",
                marginBottom: ".75rem",
              }}
            >
              {spot.category === "グルメ・カフェ"
                ? "この店舗の関連ニュース"
                : "この会場のイベント"}
            </h2>
            <ul
              className="article-list"
              style={{ listStyle: "none", padding: 0, margin: 0 }}
            >
              {relatedArticles.map((article) => {
                const articleImage = getArticleImage(article)
                return (
                  <li key={article.id}>
                    <Link
                      href={`/articles/${article.slug}/`}
                      className="article-card-link"
                    >
                      <article className="article-card">
                        <img
                          src={articleImage.src}
                          alt={articleImage.alt}
                          width={articleImage.width}
                          height={articleImage.height}
                          className="article-card__image"
                          loading="lazy"
                          decoding="async"
                        />
                        <h3 className="article-card__title">{article.title}</h3>
                        <time
                          className="article-card__date"
                          dateTime={article.event?.startDate ?? article.publishedAt}
                        >
                          {article.event
                            ? `${formatDate(article.event.startDate)}〜${formatDate(article.event.endDate)}`
                            : formatDate(article.publishedAt)}
                        </time>
                      </article>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {otherCategorySpots.length > 0 && (
          <section aria-labelledby="spot-nearby-title" style={{ marginTop: "2rem" }}>
            <h2
              id="spot-nearby-title"
              style={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#b94a3a",
                marginBottom: ".75rem",
              }}
            >
              {spot.category}のほかのスポット
            </h2>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: ".5rem",
              }}
            >
              {otherCategorySpots.map((nearby) => (
                <li key={nearby.id}>
                  <Link
                    href={`/spots/${nearby.slug}/`}
                    style={{
                      display: "inline-block",
                      fontSize: ".8125rem",
                      color: "#24312f",
                      textDecoration: "none",
                      padding: ".4rem .75rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(96, 120, 111, 0.14)",
                    }}
                  >
                    {nearby.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link
            href="/spots/"
            style={{
              fontSize: ".875rem",
              color: "#b94a3a",
              textDecoration: "underline",
            }}
          >
            ← 観光スポット一覧に戻る
          </Link>
        </div>
      </article>
    </>
  )
}

export default Page
