"use client"

import { useState } from "react"
import Link from "next/link"
import type { Article } from "lib/articles"

export function ArticlesViewToggle({ articles }: { articles: Article[] }) {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <>
      <div className="articles-view-toggle">
        <button
          className={`articles-view-toggle__btn${view === "grid" ? " articles-view-toggle__btn--active" : ""}`}
          onClick={() => setView("grid")}
          aria-label="グリッド表示"
          aria-pressed={view === "grid"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        </button>
        <button
          className={`articles-view-toggle__btn${view === "list" ? " articles-view-toggle__btn--active" : ""}`}
          onClick={() => setView("list")}
          aria-label="リスト表示"
          aria-pressed={view === "list"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="1" y="2" width="14" height="2" rx="1" />
            <rect x="1" y="7" width="14" height="2" rx="1" />
            <rect x="1" y="12" width="14" height="2" rx="1" />
          </svg>
        </button>
      </div>
      <ul className={`article-list${view === "list" ? " article-list--list" : ""}`}>
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
                <div className="article-card__body">
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
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
