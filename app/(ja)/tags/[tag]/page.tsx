import Link from "next/link"
import { absoluteUrl } from "lib/site"
import {
  formatDate,
  getAllTags,
  getArticleImage,
  getArticlesByTag,
  getArticlePublishedDate,
} from "lib/articles"

type Props = {
  params: Promise<{ tag: string }>
}

export const generateStaticParams = () => {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  return {
    title: `「${decodedTag}」の記事一覧`,
    description: `秋葉原の${decodedTag}に関するエンタメニュース一覧`,
    alternates: { canonical: `/tags/${tag}/` },
    openGraph: {
      title: `「${decodedTag}」の記事一覧 | アキバLive`,
      description: `秋葉原の${decodedTag}に関するエンタメニュース一覧`,
      url: `/tags/${tag}/`,
      type: "website",
    },
  }
}

const Page = async ({ params }: Props) => {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const articles = getArticlesByTag(decodedTag)
  const tagUrl = absoluteUrl(`/tags/${tag}/`)

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: `「${decodedTag}」の記事`, item: tagUrl },
    ],
  }

  return (
    <>
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
              「{decodedTag}」の記事
            </li>
          </ol>
        </nav>
        <div className="home-articles__header">
          <p className="home-articles__kicker">Tag</p>
          <h1 className="home-articles__title">「{decodedTag}」の記事</h1>
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
                      {article.tags.map((t) => (
                        <span key={t} className="article-card__tag">{t}</span>
                      ))}
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
