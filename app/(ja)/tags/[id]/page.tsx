import Link from "next/link"
import { notFound } from "next/navigation"
import { absoluteUrl } from "lib/site"
import {
  formatDate,
  getAllTags,
  getArticleImage,
  getArticlesByTagId,
  getArticlePublishedDate,
  getTagById,
} from "lib/articles"

type Props = {
  params: Promise<{ id: string }>
}

export const generateStaticParams = () => {
  return getAllTags().map((tag) => ({ id: String(tag.id) }))
}

export const generateMetadata = async ({ params }: Props) => {
  const { id } = await params
  const tag = getTagById(Number(id))
  if (!tag) return {}
  const title = `秋葉原の${tag.name}イベント一覧｜開催中・予定`
  const description = `秋葉原の${tag.name}関連イベント・ニュース一覧。開催中、開催予定、ポップアップ、フェア、展示情報をまとめて確認できます。`
  return {
    title,
    description,
    alternates: { canonical: `/tags/${id}/` },
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

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: `「${tag.name}」の記事`, item: tagUrl },
    ],
  }

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `秋葉原 ${tag.name} 記事一覧`,
    url: tagUrl,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <section className="home-articles">
        <nav aria-label="パンくずリスト" className="breadcrumb">
          <ol className="breadcrumb__list">
            <li className="breadcrumb__item">
              <Link href="/">ホーム</Link>
            </li>
            <li className="breadcrumb__item breadcrumb__item--current" aria-current="page">
              「{tag.name}」の記事
            </li>
          </ol>
        </nav>
        <div className="home-articles__header">
          <p className="home-articles__kicker">Tag</p>
          <h1 className="home-articles__title">「{tag.name}」の記事</h1>
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
                        return t ? <span key={tid} className="article-card__tag">{t.name}</span> : null
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
