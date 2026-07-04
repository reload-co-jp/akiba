"use client"

import Link from "next/link"
import type { Article } from "lib/articles"
import {
  formatDate,
  getArticleImage,
  getLocalizedContent,
  getTagById,
} from "lib/articles"
import { useLang } from "./language-provider"
import AdsenseFluidAd from "./adsense-fluid-ad"

export function HomeArticlesFilter({ articles }: { articles: Article[] }) {
  const { lang } = useLang()
  const tagCounts = articles.reduce<Record<number, number>>(
    (counts, article) => {
      for (const id of article.tagIds) {
        counts[id] = (counts[id] ?? 0) + 1
      }
      return counts
    },
    {}
  )
  const tags = Object.keys(tagCounts)
    .map(Number)
    .filter((id) => tagCounts[id] >= 2)
    .map((id) => ({ id, tag: getTagById(id) }))
    .filter(
      (
        t
      ): t is { id: number; tag: NonNullable<ReturnType<typeof getTagById>> } =>
        t.tag != null
    )
    .slice(0, 30)
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
        {visibleArticles.map((article) => {
          const localized = getLocalizedContent(article, lang)
          return (
            <li key={article.id}>
              <Link
                href={`/articles/${article.slug}/`}
                className="article-card-link"
              >
                <article className="article-card">
                  <img
                    src={getArticleImage(article).src}
                    alt={getArticleImage(article).alt}
                    width={getArticleImage(article).width}
                    height={getArticleImage(article).height}
                    className="article-card__image"
                    loading="lazy"
                    decoding="async"
                  />
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
                  <h3 className="article-card__title">{localized.title}</h3>
                  <p className="article-card__summary">{localized.summary}</p>
                  <time
                    className="article-card__date"
                    dateTime={article.publishedAt}
                  >
                    {formatDate(article.publishedAt)}
                  </time>
                </article>
              </Link>
            </li>
          )
        })}
      </ul>

      {articles.length > 12 && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/articles/" className="home-articles__more">
            記事一覧をみる
          </Link>
        </div>
      )}

      <AdsenseFluidAd />

      <section className="home-tags" aria-label="記事カテゴリ">
        {tags.map(({ id, tag }) => (
          <Link key={id} href={`/tags/${id}/`} className="home-tags__item">
            {tag.name}
          </Link>
        ))}
      </section>
    </section>
  )
}
