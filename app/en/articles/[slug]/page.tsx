import Link from "next/link"
import { notFound } from "next/navigation"
import { marked } from "marked"
import { ArticleImagePreview } from "components/article-image-preview"
import {
  formatDate,
  formatDateTime,
  getAllArticles,
  getEnglishSlugs,
  getArticleBySlug,
  getArticleImage,
  getArticlePublishedIso,
  placeholderImage,
} from "lib/articles"
import { absoluteUrl } from "lib/site"

type Props = {
  params: Promise<{ slug: string }>
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
  return {
    title: article.en.title,
    description: article.en.summary,
    alternates: {
      canonical: `/en/articles/${slug}/`,
      languages: {
        "ja": `/articles/${slug}/`,
        "en": `/en/articles/${slug}/`,
      },
    },
    openGraph: {
      title: article.en.title,
      description: article.en.summary,
      url: `/en/articles/${slug}/`,
      images: [{ url: image.src, alt: image.alt }],
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: publishedAt,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.en.title,
      description: article.en.summary,
      images: [image.src],
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
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate) => ({
      article: candidate,
      matchingTagCount: candidate.tags.filter((tag) => article.tags.includes(tag)).length,
    }))
    .filter((candidate) => candidate.matchingTagCount > 0)
    .sort(
      (a, b) =>
        b.matchingTagCount - a.matchingTagCount ||
        new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime(),
    )
    .slice(0, 3)

  const articleUrl = absoluteUrl(`/en/articles/${slug}/`)
  const articleImage = getArticleImage(article)
  const publishedAt = getArticlePublishedIso(article)
  const isPlaceholderImage = articleImage.src === placeholderImage.src

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    headline: en.title,
    description: en.summary,
    keywords: article.tags.join(", "),
    datePublished: publishedAt,
    dateModified: publishedAt,
    isAccessibleForFree: true,
    url: articleUrl,
    author: {
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
        url: absoluteUrl("/images/logo.svg"),
        width: 195,
        height: 48,
      },
    },
    image: { "@type": "ImageObject", url: absoluteUrl(articleImage.src) },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: en.title, item: articleUrl },
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
    <article style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem 0" }}>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol className="breadcrumb__list">
          <li className="breadcrumb__item">
            <Link href="/">Home</Link>
          </li>
          <li className="breadcrumb__item breadcrumb__item--current" aria-current="page">
            {en.title}
          </li>
        </ol>
      </nav>

      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".75rem" }}>
        {article.tags.map((tag) => (
          <Link key={tag} href={{ pathname: "/articles/", query: { tag } }} className="article-tag">
            {tag}
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: ".75rem" }}>
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
        style={{ fontSize: ".75rem", color: "#8a6f63", display: "block", marginBottom: "1.5rem" }}
      >
        {formatDateTime(article)}
      </time>

      <figure className="article-hero-image">
        {isPlaceholderImage ? (
          <img src={articleImage.src} alt={articleImage.alt} />
        ) : (
          <ArticleImagePreview src={articleImage.src} alt={articleImage.alt} />
        )}
        {article.image?.sourceLabel && (
          <figcaption>
            Image:{" "}
            {article.image.sourceUrl ? (
              <a href={article.image.sourceUrl} rel="noopener noreferrer" target="_blank">
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
          <h2 style={{ fontSize: ".875rem", fontWeight: "bold", color: "#b94a3a", margin: "0 0 .75rem" }}>
            Event Info
          </h2>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: ".25rem .75rem" }}>
            <dt style={{ color: "#8a6f63" }}>Venue</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>{article.event.venue}</dd>
            <dt style={{ color: "#8a6f63" }}>Dates</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>
              {article.event.startDate} – {article.event.endDate}
            </dd>
            <dt style={{ color: "#8a6f63" }}>Price</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>{article.event.price}</dd>
            <dt style={{ color: "#8a6f63" }}>Reservation</dt>
            <dd style={{ color: "#24312f", margin: 0 }}>{article.event.reservation ? "Required" : "Not required"}</dd>
          </dl>
        </div>
      )}

      <div className="article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

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
          <h2 id="article-sources-title" style={{ fontSize: ".875rem", fontWeight: "bold", color: "#b94a3a", margin: "0 0 .75rem" }}>
            Sources
          </h2>
          <ul style={{ color: "#3f5851", fontSize: ".875rem", lineHeight: "1.7", margin: 0, paddingLeft: "1.25rem" }}>
            {article.sources.map((source) => (
              <li key={`${source.label}-${source.url ?? "text"}`}>
                {source.url ? (
                  <a href={source.url} rel="noopener noreferrer" target="_blank" style={{ color: "#b94a3a" }}>
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

      <section className="article-tags-nav" aria-labelledby="article-tags-title">
        <h2 id="article-tags-title">Tags</h2>
        <div className="article-tags-nav__list">
          {article.tags.map((tag) => (
            <Link key={tag} href={{ pathname: "/articles/", query: { tag } }} className="article-tags-nav__item">
              {tag}
            </Link>
          ))}
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="related-articles" aria-labelledby="related-articles-title">
          <div className="home-articles__header">
            <p className="home-articles__kicker">Related</p>
            <h2 id="related-articles-title" className="home-articles__title">Related Articles</h2>
          </div>
          <ul className="article-list related-articles__list">
            {relatedArticles.map(({ article: relatedArticle }) => (
              <li key={relatedArticle.id}>
                <Link href={`/articles/${relatedArticle.slug}/`} className="article-card-link">
                  <article className="article-card">
                    <img
                      src={getArticleImage(relatedArticle).src}
                      alt={getArticleImage(relatedArticle).alt}
                      className="article-card__image"
                    />
                    <div className="article-card__tags">
                      {relatedArticle.tags.map((tag) => (
                        <span key={tag} className="article-card__tag">{tag}</span>
                      ))}
                    </div>
                    <h3 className="article-card__title">{relatedArticle.title}</h3>
                    <time className="article-card__date" dateTime={relatedArticle.publishedAt}>
                      {formatDate(relatedArticle.publishedAt)}
                    </time>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
    </>
  )
}

export default Page
