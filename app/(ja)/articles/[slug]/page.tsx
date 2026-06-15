import Link from "next/link"
import { notFound } from "next/navigation"
import AdsenseFluidAd from "components/adsense-fluid-ad"
import { marked } from "marked"
import { ArticleImagePreview } from "components/article-image-preview"
import {
  formatDate,
  formatDateTime,
  getAllArticles,
  getAllSlugs,
  getArticleBySlug,
  getArticleImage,
  getArticlePublishedIso,
  getArticleTagNames,
  getAuthorById,
  getTagById,
  placeholderImage,
  addAkihabaraSeoTitle,
} from "lib/articles"
import { getSpotByVenueName } from "lib/spots"
import { absoluteUrl } from "lib/site"

type Props = {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => {
  return getAllSlugs().map((slug) => ({ slug }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  const image = getArticleImage(article)
  const publishedAt = getArticlePublishedIso(article)
  return {
    title: addAkihabaraSeoTitle(article.title),
    description: article.summary,
    alternates: {
      canonical: `/articles/${slug}/`,
      ...(article.en && {
        languages: {
          "x-default": `/articles/${slug}/`,
          ja: `/articles/${slug}/`,
          en: `/en/articles/${slug}/`,
        },
      }),
    },
    openGraph: {
      title: addAkihabaraSeoTitle(article.title),
      description: article.summary,
      url: `/articles/${slug}/`,
      images: [
        {
          url: image.src,
          alt: image.alt,
          ...(image.width && { width: image.width }),
          ...(image.height && { height: image.height }),
        },
      ],
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: publishedAt,
      tags: getArticleTagNames(article),
    },
    twitter: {
      card: "summary_large_image",
      title: addAkihabaraSeoTitle(article.title),
      description: article.summary,
      images: [image.src],
    },
    other: {
      news_keywords: getArticleTagNames(article).slice(0, 10).join(", "),
    },
  }
}

const Page = async ({ params }: Props) => {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const contentHtml = await marked(article.content)
  const relatedArticles = getAllArticles()
    .filter((candidate) => candidate.slug !== article.slug)
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
  const relatedSpot = article.event ? getSpotByVenueName(article.event.venue) : undefined
  const articleUrl = absoluteUrl(`/articles/${slug}/`)
  const articleImage = getArticleImage(article)
  const publishedAt = getArticlePublishedIso(article)
  const isPlaceholderImage = articleImage.src === placeholderImage.src

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    headline: addAkihabaraSeoTitle(article.title),
    description: article.summary,
    keywords: getArticleTagNames(article).join(", "),
    inLanguage: "ja",
    datePublished: publishedAt,
    dateModified: publishedAt,
    isAccessibleForFree: true,
    url: articleUrl,
    author: author
      ? { "@type": author.schemaType ?? "Person", name: author.name }
      : { "@type": "Organization", name: "アキバLive", url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: "アキバLive",
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
  }

  const eventJsonLd = article.event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: addAkihabaraSeoTitle(article.title),
        description: article.summary,
        startDate: article.event.startDate,
        endDate: article.event.endDate,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        isAccessibleForFree: article.event.price === "無料",
        url: articleUrl,
        image: absoluteUrl(articleImage.src),
        location: {
          "@type": "Place",
          name: article.event.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: "秋葉原",
            addressRegion: "東京都",
            addressCountry: "JP",
          },
        },
        organizer: {
          "@type": "Organization",
          name: "アキバLive",
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
        name: "ホーム",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: addAkihabaraSeoTitle(article.title),
        item: articleUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}
      <article
        style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem 0" }}
      >
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li
              className="breadcrumb__item breadcrumb__item--current"
              aria-current="page"
            >
              {article.title}
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
          {article.tagIds.map((tid) => {
            const t = getTagById(tid)
            return t ? (
              <Link key={tid} href={`/tags/${tid}/`} className="article-tag">
                {t.name}
              </Link>
            ) : null
          })}
        </div>

        {article.en && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: ".75rem",
            }}
          >
            <Link href={`/en/articles/${slug}/`} className="language-toggle">
              Read in English
            </Link>
          </div>
        )}

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#24312f",
            margin: "0 0 .5rem",
            lineHeight: "1.4",
          }}
        >
          {article.title}
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
            <img src={articleImage.src} alt={articleImage.alt} />
          ) : (
            <ArticleImagePreview
              src={articleImage.src}
              alt={articleImage.alt}
            />
          )}
          {article.image?.sourceLabel && (
            <figcaption>
              画像:{" "}
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
              イベント情報
            </h2>
            <dl
              style={{
                margin: 0,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: ".25rem .75rem",
              }}
            >
              <dt style={{ color: "#8a6f63" }}>会場</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>
                {relatedSpot ? (
                  <Link href={`/spots/${relatedSpot.slug}/`} style={{ color: "#b94a3a" }}>
                    {article.event.venue}
                  </Link>
                ) : (
                  article.event.venue
                )}
              </dd>
              <dt style={{ color: "#8a6f63" }}>期間</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>
                {article.event.startDate} 〜 {article.event.endDate}
              </dd>
              <dt style={{ color: "#8a6f63" }}>料金</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>
                {article.event.price}
              </dd>
              <dt style={{ color: "#8a6f63" }}>予約</dt>
              <dd style={{ color: "#24312f", margin: 0 }}>
                {article.event.reservation ? "要予約" : "不要"}
              </dd>
            </dl>
            <p style={{ margin: ".75rem 0 0", fontSize: ".8125rem" }}>
              <Link href="/events/today/" style={{ color: "#3f5851" }}>
                → 今日開催の秋葉原イベント一覧を見る
              </Link>
            </p>
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {article.sources && article.sources.length > 0 && (
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
              情報ソース
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
              {article.sources.map((source) => (
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

        {author && (
          <div
            style={{
              borderTop: "1px solid rgba(96, 120, 111, 0.14)",
              marginTop: "2rem",
              paddingTop: "1rem",
              fontSize: ".875rem",
              color: "#8a6f63",
            }}
          >
            <span>執筆: </span>
            <Link
              href={`/authors/${article.authorId}/`}
              style={{ color: "#24312f", fontWeight: "500" }}
            >
              {author.name}
            </Link>
          </div>
        )}
        <AdsenseFluidAd />

        <section
          className="article-tags-nav"
          aria-labelledby="article-tags-title"
        >
          <h2 id="article-tags-title">タグ</h2>
          <div className="article-tags-nav__list">
            {article.tagIds.map((tid) => {
              const t = getTagById(tid)
              return t ? (
                <Link
                  key={tid}
                  href={`/tags/${tid}/`}
                  className="article-tags-nav__item"
                >
                  {t.name}
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
                類似記事
              </h2>
            </div>
            <ul className="article-list related-articles__list">
              {relatedArticles.map(({ article: relatedArticle }) => (
                <li key={relatedArticle.id}>
                  <Link
                    href={`/articles/${relatedArticle.slug}/`}
                    className="article-card-link"
                  >
                    <article className="article-card">
                      <img
                        src={getArticleImage(relatedArticle).src}
                        alt={getArticleImage(relatedArticle).alt}
                        className="article-card__image"
                      />
                      <div className="article-card__tags">
                        {relatedArticle.tagIds.map((tid) => {
                          const t = getTagById(tid)
                          return t ? (
                            <span key={tid} className="article-card__tag">
                              {t.name}
                            </span>
                          ) : null
                        })}
                      </div>
                      <h3 className="article-card__title">
                        {relatedArticle.title}
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
