import Link from "next/link"
import { notFound } from "next/navigation"
import { absoluteUrl, siteName } from "lib/site"
import {
  formatDate,
  getAllAuthors,
  getArticleImage,
  getArticlesByAuthorId,
  getArticlePublishedDate,
  getAuthorById,
  getTagById,
} from "lib/articles"

type Props = {
  params: Promise<{ id: string }>
}

export const generateStaticParams = () =>
  getAllAuthors().map((author) => ({ id: String(author.id) }))

export const generateMetadata = async ({ params }: Props) => {
  const { id } = await params
  const author = getAuthorById(Number(id))
  if (!author) return {}
  const description = author.description
    ? `${author.name} — ${author.description}。アキバLiveの執筆者ページ。`
    : `${author.name} による秋葉原エンタメ記事一覧。`
  return {
    title: `${author.name}の記事一覧`,
    description,
    alternates: { canonical: `/authors/${id}/` },
    openGraph: {
      title: `${author.name}の記事一覧 | ${siteName}`,
      description,
      url: `/authors/${id}/`,
      type: "profile",
      images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name}の記事一覧 | ${siteName}`,
      description,
      images: ["/images/hero.jpg"],
    },
  }
}

const Page = async ({ params }: Props) => {
  const { id } = await params
  const author = getAuthorById(Number(id))
  if (!author) notFound()

  const articles = getArticlesByAuthorId(author.id)
  const authorUrl = absoluteUrl(`/authors/${id}/`)

  const profileLd = {
    "@context": "https://schema.org",
    "@type": author.schemaType === "Organization" ? "Organization" : "ProfilePage",
    "@id": authorUrl,
    name: author.name,
    url: authorUrl,
    ...(author.description ? { description: author.description } : {}),
    ...(author.schemaType !== "Organization"
      ? {
          mainEntity: {
            "@type": "Person",
            name: author.name,
            url: authorUrl,
            ...(author.description ? { description: author.description } : {}),
            worksFor: {
              "@type": "Organization",
              name: siteName,
              url: absoluteUrl("/"),
            },
          },
        }
      : {}),
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: `${author.name}の記事`, item: authorUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="home-articles">
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current" aria-current="page">
              {author.name}
            </li>
          </ol>
        </nav>
        <div className="home-articles__header">
          <p className="home-articles__kicker">Author</p>
          <h1 className="home-articles__title">{author.name}</h1>
          {author.description && (
            <p style={{ color: "#8a6f63", fontSize: ".875rem", marginTop: ".5rem" }}>
              {author.description}
            </p>
          )}
        </div>
        <ul className="article-list">
          {articles.map((article) => (
            <li key={article.id}>
              <Link href={`/articles/${article.slug}/`} className="article-card-link">
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
                            {t.name}
                          </span>
                        ) : null
                      })}
                    </div>
                    <h2 className="article-card__title">{article.title}</h2>
                    <p className="article-card__summary">{article.summary}</p>
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
