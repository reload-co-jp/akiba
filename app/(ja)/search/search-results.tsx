"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Article } from "lib/articles"
import { formatDate, getArticleImage } from "lib/articles"

export function SearchResults({ articles }: { articles: Article[] }) {
  const searchParams = useSearchParams()
  const q = searchParams.get("q")?.trim() ?? ""

  const results = q
    ? articles.filter(
        (a) =>
          a.title.includes(q) ||
          a.summary.includes(q) ||
          a.tags.some((t) => t.includes(q)),
      )
    : []

  return (
    <>
      {q && (
        <p className="article-filter-status">
          「{q}」の検索結果: {results.length}件
        </p>
      )}
      {!q && <p style={{ color: "#8a6f63" }}>キーワードを入力してください。</p>}
      {q && results.length === 0 && (
        <p style={{ color: "#8a6f63" }}>該当する記事が見つかりませんでした。</p>
      )}
      <ul className="article-list">
        {results.map((article) => (
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
                  <time className="article-card__date" dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
