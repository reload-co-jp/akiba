"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { Article } from "lib/articles"
import {
  formatDate,
  getArticleImage,
  getArticleTagNames,
  getLocalizedContent,
  getTagById,
} from "lib/articles"
import { useLang } from "./language-provider"
import AdsenseFluidAd from "./adsense-fluid-ad"

export function ArticlesViewToggle({ articles }: { articles: Article[] }) {
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const selectedTag = searchParams.get("tag")
  const [view, setView] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q")?.trim() ?? ""
  )

  const q = searchQuery.trim()
  const visibleArticles = articles.filter((article) => {
    const tagMatch = selectedTag
      ? article.tagIds.some((id) => getTagById(id)?.name === selectedTag)
      : true
    const searchMatch = q
      ? article.title.includes(q) ||
        article.summary.includes(q) ||
        getArticleTagNames(article).some((t) => t.includes(q))
      : true
    return tagMatch && searchMatch
  })

  return (
    <>
      <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          className="search-form__input"
          placeholder="キーワードで絞り込む"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="記事を検索"
        />
      </form>
      {(selectedTag || q) && (
        <div className="article-filter-status">
          {selectedTag && <span>「{selectedTag}」の記事</span>}
          {q && (
            <span>
              「{q}」の検索結果: {visibleArticles.length}件
            </span>
          )}
          <Link
            href="/articles/"
            className="article-filter-status__reset"
            onClick={() => setSearchQuery("")}
          >
            すべて表示
          </Link>
        </div>
      )}
      <div className="articles-view-toggle">
        <button
          className={`articles-view-toggle__btn${view === "grid" ? " articles-view-toggle__btn--active" : ""}`}
          onClick={() => setView("grid")}
          aria-label="グリッド表示"
          aria-pressed={view === "grid"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect x="1" y="2" width="14" height="2" rx="1" />
            <rect x="1" y="7" width="14" height="2" rx="1" />
            <rect x="1" y="12" width="14" height="2" rx="1" />
          </svg>
        </button>
      </div>
      <ul
        className={`article-list${view === "list" ? " article-list--list" : ""}`}
      >
        {visibleArticles.map((article, i) => {
          const localized = getLocalizedContent(article, lang)
          return (
            <>
              <li key={article.id}>
                <Link
                  href={`/articles/${article.slug}/`}
                  className="article-card-link"
                >
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
                      <h2 className="article-card__title">{localized.title}</h2>
                      <p className="article-card__summary">
                        {localized.summary}
                      </p>
                      <time
                        className="article-card__date"
                        dateTime={article.publishedAt}
                      >
                        {formatDate(article.publishedAt)}
                      </time>
                    </div>
                  </article>
                </Link>
              </li>
              {i % 10 === 9 && (
                <li key={`ad-${i}`}>
                  <AdsenseFluidAd />
                </li>
              )}
            </>
          )
        })}
      </ul>
    </>
  )
}
