import Link from "next/link"
import { getAllArticles } from "lib/articles"

export const metadata = {
  title: "アキバLive",
  description: "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
}

const Page = () => {
  const articles = getAllArticles()
  const latestArticle = articles[0]
  const tags = [...new Set(articles.flatMap((article) => article.tags))]

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__content">
          <p className="home-hero__kicker">Akihabara journal</p>
          <h1 className="home-hero__title">アキバLive</h1>
          <p className="home-hero__lead">
            懐かしさと熱気が交差する街で、今日出会えるエンタメの気配を集めます。
          </p>
          {latestArticle && (
            <Link className="home-hero__link" href={`/${latestArticle.slug}/`}>
              最新記事を読む
            </Link>
          )}
        </div>
      </section>

      <section className="home-tags" aria-label="記事カテゴリ">
        {tags.map((tag) => (
          <span key={tag} className="home-tags__item">
            {tag}
          </span>
        ))}
      </section>

      <section className="home-articles" aria-labelledby="home-articles-title">
        <div className="home-articles__header">
          <p className="home-articles__kicker">News diary</p>
          <h2 id="home-articles-title" className="home-articles__title">
            新着記事
          </h2>
        </div>
        <ul className="article-list">
          {articles.map((article) => (
            <li key={article.id}>
              <Link href={`/${article.slug}/`} className="article-card-link">
                <article className="article-card">
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
                    {article.publishedAt}
                  </time>
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
