import Link from "next/link"
import type { Article } from "lib/articles"
import { formatDate } from "lib/articles"

export function HomeArticlesFilter({ articles }: { articles: Article[] }) {
  const tags = [...new Set(articles.flatMap((article) => article.tags))]
  const visibleArticles = articles.slice(0, 12)

  return (
    <section className="home-articles" aria-labelledby="home-articles-title">
      <div className="home-articles__header">
        <p className="home-articles__kicker">News diary</p>
        <h2 id="home-articles-title" className="home-articles__title">
          新着記事
        </h2>
      </div>

      <ul className="article-list">
        {visibleArticles.map((article) => (
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
                <h3 className="article-card__title">{article.title}</h3>
                <p className="article-card__summary">{article.summary}</p>
                <time className="article-card__date" dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
              </article>
            </Link>
          </li>
        ))}
      </ul>

      {articles.length > 12 && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/articles/" className="home-articles__more">
            記事一覧をみる
          </Link>
        </div>
      )}

      <section className="home-tags" aria-label="記事カテゴリ">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={{ pathname: "/articles/", query: { tag } }}
            className="home-tags__item"
          >
            {tag}
          </Link>
        ))}
      </section>
    </section>
  )
}
