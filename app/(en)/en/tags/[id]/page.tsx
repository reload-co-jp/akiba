import Link from "next/link"
import { notFound } from "next/navigation"
import { absoluteUrl } from "lib/site"
import {
  formatDate,
  getAllTags,
  getArticleImage,
  getArticlePublishedDate,
  getArticlesByTagId,
  getTagById,
  getTagEnName,
} from "lib/articles"

type Props = {
  params: Promise<{ id: string }>
}

export const generateStaticParams = () => {
  return getAllTags()
    .filter((tag) => getArticlesByTagId(tag.id).some((a) => a.en))
    .map((tag) => ({ id: String(tag.id) }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { id } = await params
  const tag = getTagById(Number(id))
  if (!tag) return {}
  const enName = getTagEnName(tag)
  return {
    title: `${enName} — Akihabara Articles`,
    description: `Akihabara articles tagged with ${enName}`,
    alternates: {
      canonical: `/en/tags/${id}/`,
      languages: {
        "x-default": `/en/tags/${id}/`,
        ja: `/tags/${id}/`,
        "ja-JP": `/tags/${id}/`,
        en: `/en/tags/${id}/`,
        "en-US": `/en/tags/${id}/`,
      },
    },
    openGraph: {
      title: `${enName} — Akihabara Articles | Akiba Live`,
      description: `Akihabara articles tagged with ${enName}`,
      url: `/en/tags/${id}/`,
      type: "website",
      locale: "en_US",
      images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${enName} — Akihabara Articles | Akiba Live`,
      description: `Akihabara articles tagged with ${enName}`,
      images: ["/images/hero.jpg"],
    },
  }
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const tag = getTagById(Number(id))
  if (!tag) notFound()

  const articles = getArticlesByTagId(tag.id).filter((a) => a.en)
  if (articles.length === 0) notFound()

  const enName = getTagEnName(tag)
  const tagUrl = absoluteUrl(`/en/tags/${id}/`)

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/en/") },
      { "@type": "ListItem", position: 2, name: `${enName} articles`, item: tagUrl },
    ],
  }

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Akihabara ${enName} articles`,
    url: tagUrl,
    inLanguage: "en",
    numberOfItems: articles.length,
    itemListElement: articles.map((article, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: article.en!.title,
      url: absoluteUrl(`/en/articles/${article.slug}/`),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <section className="home-articles">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">Home</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current" aria-current="page">
              {enName}
            </li>
          </ol>
        </nav>
        <div className="home-articles__header">
          <p className="home-articles__kicker">Tag</p>
          <h1 className="home-articles__title">{enName}</h1>
        </div>
        <ul className="article-list">
          {articles.map((article) => (
            <li key={article.id}>
              <Link href={`/en/articles/${article.slug}/`} className="article-card-link">
                <article className="article-card">
                  <img
                    src={getArticleImage(article).src}
                    alt={getArticleImage(article).alt}
                    className="article-card__image"
                  />
                  <div className="article-card__body">
                    <div className="article-card__tags">
                      {article.tagIds.map((tid) => {
                        const t = getTagById(tid)
                        return t ? (
                          <span key={tid} className="article-card__tag">
                            {getTagEnName(t)}
                          </span>
                        ) : null
                      })}
                    </div>
                    <h2 className="article-card__title">{article.en!.title}</h2>
                    <p className="article-card__summary">{article.en!.summary}</p>
                    <time
                      className="article-card__date"
                      dateTime={getArticlePublishedDate(article).toISOString()}
                    >
                      {formatDate(article.publishedAt)}
                    </time>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default Page
