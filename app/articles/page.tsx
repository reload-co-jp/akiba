import Link from "next/link"
import { getAllArticles } from "lib/articles"

export const metadata = {
  title: "記事一覧",
  description: "アキバLiveの記事一覧です。秋葉原のエンタメ情報をお届けします。",
  alternates: { canonical: "/articles/" },
  openGraph: {
    title: "記事一覧 | アキバLive",
    description: "アキバLiveの記事一覧です。秋葉原のエンタメ情報をお届けします。",
    url: "/articles/",
    type: "website",
  },
}

const Page = () => {
  const articles = getAllArticles()

  return (
    <section className="home-articles" aria-labelledby="articles-page-title">
      <div className="home-articles__header">
        <p className="home-articles__kicker">News diary</p>
        <h1 id="articles-page-title" className="home-articles__title">
          記事一覧
        </h1>
      </div>
      <ul className="article-list">
        {articles.map((article) => (
          <li key={article.id}>
            <Link href={`/articles/${article.slug}/`} className="article-card-link">
              <article className="article-card">
                {article.image && (
                  <img
                    src={article.image.src}
                    alt={article.image.alt}
                    className="article-card__image"
                  />
                )}
                <div className="article-card__tags">
                  {article.tags.map((tag) => (
                    <span key={tag} className="article-card__tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="article-card__title">{article.title}</h2>
                <p className="article-card__summary">{article.summary}</p>
                <time className="article-card__date" dateTime={article.publishedAt}>
                  {article.publishedAt}
                </time>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Page
