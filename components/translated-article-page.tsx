import SensitiveImg from "components/sensitive-img"
import { jsonLdScript } from "lib/json-ld"
import Link from "next/link"
import { notFound } from "next/navigation"
import AdsenseFluidAd from "components/adsense-fluid-ad"
import AdsenseDisplayAd from "components/adsense-display-ad"
import AdsenseInArticleAd from "components/adsense-in-article-ad"
import { marked } from "marked"
import { ArticleImagePreview } from "components/article-image-preview"
import { ArticleVenueMap } from "components/article-venue-map"
import {
  formatDate,
  formatDateTime,
  getArticleLinkSources,
  getRelatedArticles,
  getTranslatedSlugs,
  getArticleBySlug,
  getArticleImage,
  getArticlePublishedIso,
  getAuthorById,
  getChineseEventPrice,
  getChineseEventVenue,
  getChineseSeoDescription,
  getChineseSeoKeywords,
  getChineseSeoTitle,
  getEnglishEventPrice,
  getEnglishEventVenue,
  getEnglishSeoDescription,
  getEnglishSeoKeywords,
  getEnglishSeoTitle,
  getTagById,
  getTagEnName,
  placeholderImage,
  type Article,
  type Tag,
  type TranslatedLang,
} from "lib/articles"
import { absoluteUrl } from "lib/site"
import { getSpotByVenueName } from "lib/spots"
import { getVenuePoint } from "lib/venue-points"

type Props = {
  params: Promise<{ slug: string }>
}

const copy = {
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    seoTitle: getEnglishSeoTitle,
    seoDescription: getEnglishSeoDescription,
    seoKeywords: getEnglishSeoKeywords,
    venue: getEnglishEventVenue,
    price: getEnglishEventPrice,
    tagName: getTagEnName,
    tagHref: (id: number) => `/en/tags/${id}/`,
    place: "Akihabara, Tokyo",
    aboutThings: ["Akihabara events", "Tokyo pop culture"],
    imageSource: "Image source",
    image: "Image",
    home: "Home",
    readInJapanese: "日本語で読む",
    eventInfo: "Event Info",
    venueLabel: "Venue",
    datesLabel: "Dates",
    priceLabel: "Price",
    reservationLabel: "Reservation",
    required: "Required",
    notRequired: "Not required",
    advertisement: "Advertisement",
    openMap: "Open in Google Maps",
    links: "Official / Reference Links",
    tags: "Tags",
    relatedKicker: "Related",
    related: "Related Articles",
  },
  zh: {
    htmlLang: "zh-Hans",
    ogLocale: "zh_CN",
    seoTitle: getChineseSeoTitle,
    seoDescription: getChineseSeoDescription,
    seoKeywords: getChineseSeoKeywords,
    venue: getChineseEventVenue,
    price: getChineseEventPrice,
    // ponytail: 中文タグ名なし、日本語タグページへリンク。zh タグページ作る時に nameZh 追加
    tagName: (tag: Tag) => tag.name,
    tagHref: (id: number) => `/tags/${id}/`,
    place: "东京秋叶原",
    aboutThings: ["秋叶原活动", "东京动漫文化"],
    imageSource: "图片来源",
    image: "图片",
    home: "首页",
    readInJapanese: "日本語で読む",
    eventInfo: "活动信息",
    venueLabel: "会场",
    datesLabel: "日期",
    priceLabel: "价格",
    reservationLabel: "预约",
    required: "需要",
    notRequired: "不需要",
    advertisement: "广告",
    openMap: "在 Google 地图中打开",
    links: "官方 / 参考链接",
    tags: "标签",
    relatedKicker: "Related",
    related: "相关文章",
  },
} satisfies Record<TranslatedLang, Record<string, unknown>>

const articleLanguages = (article: Article) => {
  const { slug } = article
  return {
    "x-default": `/articles/${slug}/`,
    ja: `/articles/${slug}/`,
    "ja-JP": `/articles/${slug}/`,
    ...(article.en && {
      en: `/en/articles/${slug}/`,
      "en-US": `/en/articles/${slug}/`,
    }),
    ...(article.zh && { "zh-Hans": `/zh/articles/${slug}/` }),
  }
}

/** /en/ と /zh/ の記事詳細ページ。 */
export const createTranslatedArticlePage = (lang: TranslatedLang) => {
  const t = copy[lang]

  const generateStaticParams = () => {
    return getTranslatedSlugs(lang).map((slug) => ({ slug }))
  }

  const generateMetadata = async ({ params }: Props) => {
    const { slug } = await params
    const article = getArticleBySlug(slug)
    if (!article?.[lang]) return {}
    const image = getArticleImage(article)
    const publishedAt = getArticlePublishedIso(article)
    const seoTitle = t.seoTitle(article)
    const seoDescription = t.seoDescription(article)
    const seoKeywords = t.seoKeywords(article)
    return {
      title: seoTitle,
      description: seoDescription,
      keywords: seoKeywords,
      alternates: {
        canonical: `/${lang}/articles/${slug}/`,
        languages: articleLanguages(article),
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: `/${lang}/articles/${slug}/`,
        images: [
          {
            url: image.src,
            alt: image.alt,
            ...(image.width && { width: image.width }),
            ...(image.height && { height: image.height }),
          },
        ],
        type: "article",
        locale: t.ogLocale,
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
    if (!article?.[lang]) notFound()

    const localized = article[lang]!
    const contentHtml = await marked(localized.content)
    const relatedArticles = getRelatedArticles(article, lang)

    const author = article.authorId
      ? getAuthorById(article.authorId)
      : undefined
    const articleUrl = absoluteUrl(`/${lang}/articles/${slug}/`)
    const articleImage = getArticleImage(article)
    const publishedAt = getArticlePublishedIso(article)
    const isPlaceholderImage = articleImage.src === placeholderImage.src
    const seoTitle = t.seoTitle(article)
    const seoDescription = t.seoDescription(article)
    const seoKeywords = t.seoKeywords(article)
    const seoVenue = t.venue(article)
    const seoPrice = t.price(article)
    const relatedSpot = article.event
      ? getSpotByVenueName(article.event.venue)
      : undefined
    const spotPoint =
      relatedSpot?.lat && relatedSpot.lng
        ? { lat: relatedSpot.lat, lng: relatedSpot.lng }
        : undefined
    const venuePoint = article.event
      ? (spotPoint ?? getVenuePoint(article.event.venue))
      : undefined
    const articleLinkSources = getArticleLinkSources(article, t.imageSource)
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
      inLanguage: t.htmlLang,
      datePublished: publishedAt,
      dateModified: publishedAt,
      isAccessibleForFree: true,
      url: articleUrl,
      author: author
        ? { "@type": author.schemaType ?? "Person", name: author.name }
        : {
            "@type": "Organization",
            name: "Akiba Live",
            url: absoluteUrl("/"),
          },
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
        { "@type": "Place", name: t.place },
        ...t.aboutThings.map((name) => ({ "@type": "Thing", name })),
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
          inLanguage: t.htmlLang,
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
            : {
                "@type": "Organization",
                name: "Akiba Live",
                url: absoluteUrl("/"),
              },
        }
      : null

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t.home,
          item: absoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: localized.title,
          item: articleUrl,
        },
      ],
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
        {eventLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdScript(eventLd) }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
        />
        <article
          style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem 0" }}
        >
          <nav aria-label="Breadcrumb" className="breadcrumb">
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
                <Link href="/">{t.home}</Link>
              </li>
              <li
                className="breadcrumb__item breadcrumb__item--current"
                aria-current="page"
              >
                {localized.title}
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
              {t.readInJapanese}
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
            {localized.title}
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
              <SensitiveImg
                sensitive={articleImage.sensitive}
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
                {t.image}:{" "}
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
                {t.eventInfo}
              </h2>
              <dl
                style={{
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: ".25rem .75rem",
                }}
              >
                <dt style={{ color: "#8a6f63" }}>{t.venueLabel}</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>{seoVenue}</dd>
                <dt style={{ color: "#8a6f63" }}>{t.datesLabel}</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>
                  {article.event.startDate} – {article.event.endDate}
                </dd>
                <dt style={{ color: "#8a6f63" }}>{t.priceLabel}</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>{seoPrice}</dd>
                <dt style={{ color: "#8a6f63" }}>{t.reservationLabel}</dt>
                <dd style={{ color: "#24312f", margin: 0 }}>
                  {article.event.reservation ? t.required : t.notRequired}
                </dd>
              </dl>
            </div>
          )}

          {article.event && (
            <aside
              aria-label={t.advertisement}
              style={{ maxWidth: "480px", margin: "0 auto 1.5rem" }}
            >
              <AdsenseInArticleAd />
            </aside>
          )}

          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {venuePoint && article.event && (
            <div style={{ marginBottom: "1.5rem" }}>
              <ArticleVenueMap
                venue={seoVenue}
                lat={venuePoint.lat}
                lng={venuePoint.lng}
                query={
                  relatedSpot?.address
                    ? `${article.event.venue} ${relatedSpot.address}`
                    : `${article.event.venue} Akihabara`
                }
                mapLabel={t.openMap}
              />
            </div>
          )}

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
                {t.links}
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
            <h2 id="article-tags-title">{t.tags}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {article.tagIds.map((tid) => {
                const tag = getTagById(tid)
                return tag ? (
                  <Link
                    key={tid}
                    href={t.tagHref(tid)}
                    className="article-tags-nav__item"
                  >
                    {t.tagName(tag)}
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
                <p className="home-articles__kicker">{t.relatedKicker}</p>
                <h2
                  id="related-articles-title"
                  className="home-articles__title"
                >
                  {t.related}
                </h2>
              </div>
              <ul className="article-list related-articles__list">
                {relatedArticles.map((relatedArticle) => {
                  const image = getArticleImage(relatedArticle)
                  return (
                    <li key={relatedArticle.id}>
                      <Link
                        href={`/${lang}/articles/${relatedArticle.slug}/`}
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
                          <div className="article-card__tags">
                            {relatedArticle.tagIds.map((tid) => {
                              const tag = getTagById(tid)
                              return tag ? (
                                <span key={tid} className="article-card__tag">
                                  {t.tagName(tag)}
                                </span>
                              ) : null
                            })}
                          </div>
                          <h3 className="article-card__title">
                            {relatedArticle[lang]!.title}
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
                  )
                })}
              </ul>
            </section>
          )}
          <AdsenseFluidAd />
          <AdsenseDisplayAd />
        </article>
      </>
    )
  }

  return { generateStaticParams, generateMetadata, Page }
}
