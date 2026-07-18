import Link from "next/link"
import { notFound } from "next/navigation"
import AdsenseFluidAd from "components/adsense-fluid-ad"
import { marked } from "marked"
import { ArticleImagePreview } from "components/article-image-preview"
import { ArticleVenueMap } from "components/article-venue-map"
import {
  formatDate,
  formatDateTime,
  getAllArticles,
  getEnglishSlugs,
  getArticleBySlug,
  getArticleImage,
  getArticlePublishedIso,
  getAuthorById,
  getEnglishEventPrice,
  getEnglishEventVenue,
  getEnglishSeoDescription,
  getEnglishSeoKeywords,
  getEnglishSeoTitle,
  getTagById,
  getTagEnName,
  placeholderImage,
} from "lib/articles"
import { absoluteUrl } from "lib/site"
import { getSpotByVenueName } from "lib/spots"
import { getVenuePoint } from "lib/venue-points"

type Props = {
  params: Promise<{ slug: string }>
}

const getArticleLinkSources = (article: NonNullable<ReturnType<typeof getArticleBySlug>>) => {
  const links = [
    ...(article.sources ?? []),
    ...(article.image?.sourceUrl
      ? [{ label: article.image.sourceLabel ?? "Image source", url: article.image.sourceUrl }]
      : []),
  ]

  return links.filter(
    (source, index, sources) =>
      source.url == null ||
      sources.findIndex((candidate) => candidate.url === source.url) === index,
  )
}

export const generateStaticParams = () => {
  return getEnglishSlugs().map((slug) => ({ slug }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article?.en) return {}
  const image = getArticleImage(article)
  const publishedAt = getArticlePublishedIso(article)
  const seoTitle = getEnglishSeoTitle(article)
  const seoDescription = getEnglishSeoDescription(article)
  const seoKeywords = getEnglishSeoKeywords(article)
  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: `/en/articles/${slug}/`,
      languages: {
        "x-default": `/en/articles/${slug}/`,
        ja: `/articles/${slug}/`,
        "ja-JP": `/articles/${slug}/`,
        en: `/en/articles/${slug}/`,
        "en-US": `/en/articles/${slug}/`,
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: `/en/articles/${slug}/`,
      images: [
        {
          url: image.src,
          alt: image.alt,
          ...(image.width && { width: image.width }),
          ...(image.height && { height: image.height }),
        },
      ],
      type: "article",
      locale: "en_US",
      alternateLocale: ["ja_JP"],
      publishedTime: publishedAt,
      modifiedTime: publishedAt,
      tags: seoKeywords,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [image.src],
    },
    other: {
      news_keywords: seoKeywords.slice(0, 10).join(", "),
    },
  }
}

const Page = async ({ params }: Props) => {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article?.en) notFound()

  const en = article.en
  const contentHtml = await marked(en.content)
  const relatedArticles = getAllArticles()
    .filter((candidate) => candidate.slug !== article.slug && candidate.en)
    .map((candidate) => ({
      article: candidate,
      matchingTagCount: candidate.tagIds.filter((id) =>
        article.tagIds.includes(id)
      ).length,
    }))
    .filter((candidate) => candidate.matchingTagCount > 0)
    .sort(
      (a, b) =>
        b.matchingTagCount - a.matchingTagCount ||
        new Date(b.article.publishedAt).getTime() -
          new Date(a.article.publishedAt).getTime()
    )
    .slice(0, 3)

  const author = article.authorId ? getAuthorById(article.authorId) : undefined
  const articleUrl = absoluteUrl(`/en/articles/${slug}/`)
  const articleImage = getArticleImage(article)
  const publishedAt = getArticlePublishedIso(article)
  const isPlaceholderImage = articleImage.src === placeholderImage.src
  const seoTitle = getEnglishSeoTitle(article)
  const seoDescription = getEnglishSeoDescription(article)
  const seoKeywords = getEnglishSeoKeywords(article)
  const seoVenue = getEnglishEventVenue(article)
  const seoPrice = getEnglishEventPrice(article)
  const relatedSpot = article.event ? getSpotByVenueName(article.event.venue) : undefined
  const venuePoint = article.event
    ? relatedSpot?.lat && relatedSpot.lng
      ? { lat: relatedSpot.lat, lng: relatedSpot.lng }
      : getVenuePoint(article.event.venue)
    : undefined
  const articleLinkSources = getArticleLinkSources(article)
  const sourceUrls = articleLinkSources
    .map((source) => source.url)
    .filter((url): url is string => Boolean(url))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    headline: seoTitle,
    description: seoDescription,
    keywords: seoKeywords.join(", "),
    inLanguage: "en",
    datePublished: publishedAt,
    dateModified: publishedAt,
    isAccessibleForFree: true,
    url: articleUrl,
    author: author
      ? { "@type": author.schemaType ?? "Person", name: author.name }
      : { "@type": "Organization", name: "Akiba Live", url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: "Akiba Live",
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/apple-icon.png"),
        width: 180,
        height: 180,
      },
    },
    image: {
      "@type": "ImageObject",
      url: absoluteUrl(articleImage.src),
      ...(articleImage.width && { width: articleImage.width }),
      ...(articleImage.height && { height: articleImage.height }),
    },
    about: [
      { "@type": "Place", name: "Akihabara, Tokyo" },
      { "@type": "Thing", name: "Akihabara events" },
      { "@type": "Thing", name: "Tokyo pop culture" },
    ],
    contentLocation: {
      "@type": "Place",
      name: "Akihabara",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Chiyoda-ku",
        addressRegion: "Tokyo",
        addressCountry: "JP",
      },
    },
    translationOfWork: {
      "@type": "NewsArticle",
      url: absoluteUrl(`/articles/${slug}/`),
      inLanguage: "ja",
    },
    mentions: [
      ...seoKeywords.map((name) => ({ "@type": "Thing", name })),
      ...(seoVenue ? [{ "@type": "Place", name: seoVenue }] : []),
    ],
    ...(sourceUrls.length > 0 ? { citation: sourceUrls } : {}),
  }

  const eventLd = article.event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: seoTitle,
        description: seoDescription,
        url: articleUrl,
        image: absoluteUrl(articleImage.src),
        startDate: article.event.startDate,
        endDate: article.event.endDate,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        isAccessibleForFree: /free|無料|入場無料/i.test(article.event.price),
        inLanguage: "en",
        location: {
          "@type": "Place",
          name: seoVenue,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Chiyoda-ku",
            addressRegion: "Tokyo",
            addressCountry: "JP",
          },
        },
        offers: {
          "@type": "Offer",
          url: articleUrl,
          price: seoPrice,
          availability: "https://schema.org/InStock",
        },
        organizer: {
          "@type": "Organization",
          name: "Akiba Live",
          url: absoluteUrl("/"),
        },
        performer: article.event.performer
          ? { "@type": "PerformingGroup", name: article.event.performer }
          : { "@type": "Organization", name: "Akiba Live", url: absoluteUrl("/") },
      }
    : null

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      { "@type": "ListItem", position: 2, name: en.title, item: articleUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {eventLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <article
        style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem 0" }}
      >
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">Home</Link>
            </li>
            <li
              className="breadcrumb__item breadcrumb__item--current"
              aria-current="page"
            >
              {en.title}
            </li>
          </ol>
        </nav>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: ".75rem",
          }}
        >
          <Link href={`/articles/${slug}/`} className="language-toggle">
            日本語で読む
          </Link>
        </div>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#24312f",
            margin: "0 0 .5rem",
            lineHeight: "1.4",
          }}
        >
          {en.title}
        </h1>

        <time
          dateTime={publishedAt}
          style={{
            fontSize: ".75rem",
            color: "#8a6f63",
            display: "block",
            marginBottom: "1.5rem",
          }}
        >
          {formatDateTime(article)}
        </time>

        <figure className="article-hero-image">
          {isPlaceholderImage ? (
            <img
              src={articleImage.src}
              alt={articleImage.alt}
              width={articleImage.width}
              height={articleImage.height}
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <ArticleImagePreview
              src={articleImage.src}
              alt={articleImage.alt}
              width={articleImage.width}
              height={articleImage.height}
            />
          )}
          {article.image?.sourceLabel && (
            <figcaption>
              Image:{" "}
              {article.image.sourceUrl ? (
                <a
                  href={article.image.sourceUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {article.image.sourceLabel}
                </a>
              ) : (
                article.image.sourceLabel
              )}
            </figcaption>
          )}
        </figure>

        {article.event && (
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
              Event Info
            </h2>
            <dl
              style={{
                margin: 0,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: ".25rem .75rem",
              }}
            >
              <dt style={{ color: "#8a6f63" }}>Venue</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>{seoVenue}</dd>
              <dt style={{ color: "#8a6f63" }}>Dates</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>
                {article.event.startDate} – {article.event.endDate}
              </dd>
              <dt style={{ color: "#8a6f63" }}>Price</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>{seoPrice}</dd>
              <dt style={{ color: "#8a6f63" }}>Reservation</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>
                {article.event.reservation ? "Required" : "Not required"}
              </dd>
            </dl>
            {venuePoint && (
              <div style={{ marginTop: "1rem" }}>
                <ArticleVenueMap
                  venue={seoVenue}
                  lat={venuePoint.lat}
                  lng={venuePoint.lng}
                  query={relatedSpot ? `${article.event.venue} ${relatedSpot.address}` : `${article.event.venue} Akihabara`}
                  mapLabel="Open in Google Maps"
                />
              </div>
            )}
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {articleLinkSources.length > 0 && (
          <section
            aria-labelledby="article-sources-title"
            style={{
              backgroundColor: "#fffdf8",
              border: "1px solid rgba(96, 120, 111, 0.14)",
              borderRadius: "8px",
              marginTop: "2rem",
              padding: "1rem",
            }}
          >
            <h2
              id="article-sources-title"
              style={{
                fontSize: ".875rem",
                fontWeight: "bold",
                color: "#b94a3a",
                margin: "0 0 .75rem",
              }}
            >
              Official / Reference Links
            </h2>
            <ul
              style={{
                color: "#3f5851",
                fontSize: ".875rem",
                lineHeight: "1.7",
                margin: 0,
                paddingLeft: "1.25rem",
              }}
            >
              {articleLinkSources.map((source) => (
                <li key={`${source.label}-${source.url ?? "text"}`}>
                  {source.url ? (
                    <a
                      href={source.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      style={{ color: "#b94a3a" }}
                    >
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        <AdsenseFluidAd />

        <section
          className="article-tags-nav"
          aria-labelledby="article-tags-title"
        >
          <h2 id="article-tags-title">Tags</h2>
          <div className="article-tags-nav__list">
            {article.tagIds.map((tid) => {
              const t = getTagById(tid)
              return t ? (
                <Link
                  key={tid}
                  href={`/en/tags/${tid}/`}
                  className="article-tags-nav__item"
                >
                  {getTagEnName(t)}
                </Link>
              ) : null
            })}
          </div>
        </section>

        {relatedArticles.length > 0 && (
          <section
            className="related-articles"
            aria-labelledby="related-articles-title"
          >
            <div className="home-articles__header">
              <p className="home-articles__kicker">Related</p>
              <h2 id="related-articles-title" className="home-articles__title">
                Related Articles
              </h2>
            </div>
            <ul className="article-list related-articles__list">
              {relatedArticles.map(({ article: relatedArticle }) => (
                <li key={relatedArticle.id}>
                  <Link
                    href={`/en/articles/${relatedArticle.slug}/`}
                    className="article-card-link"
                  >
                    <article className="article-card">
                      <img
                        src={getArticleImage(relatedArticle).src}
                        alt={getArticleImage(relatedArticle).alt}
                        width={getArticleImage(relatedArticle).width}
                        height={getArticleImage(relatedArticle).height}
                        className="article-card__image"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="article-card__tags">
                        {relatedArticle.tagIds.map((tid) => {
                          const t = getTagById(tid)
                          return t ? (
                            <span key={tid} className="article-card__tag">
                              {getTagEnName(t)}
                            </span>
                          ) : null
                        })}
                      </div>
                      <h3 className="article-card__title">
                        {relatedArticle.en!.title}
                      </h3>
                      <time
                        className="article-card__date"
                        dateTime={relatedArticle.publishedAt}
                      >
                        {formatDate(relatedArticle.publishedAt)}
                      </time>
                    </article>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <AdsenseFluidAd />
      </article>
    </>
  )
}

export default Page
