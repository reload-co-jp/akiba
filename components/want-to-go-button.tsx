"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "akiba:wantedArticles"
let memorySavedArticles: WantedArticle[] = []

export type WantedArticle = {
  id: number
  slug: string
  title: string
  image: { src: string; alt: string }
  event?: {
    venue: string
    startDate: string
    endDate: string
  }
  savedAt: string
}

type Props = {
  article: Omit<WantedArticle, "savedAt">
}

const readSavedArticles = (): WantedArticle[] => {
  try {
    if (typeof window.localStorage === "undefined") return memorySavedArticles
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return memorySavedArticles
  }
}

const writeSavedArticles = (articles: WantedArticle[]) => {
  memorySavedArticles = articles.slice(0, 100)
  try {
    if (typeof window.localStorage !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memorySavedArticles))
    }
  } catch {
    // localStorage may be blocked in previews; keep the in-memory state.
  }
  window.dispatchEvent(new Event(`${STORAGE_KEY}:changed`))
}

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(`${STORAGE_KEY}:changed`, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(`${STORAGE_KEY}:changed`, onStoreChange)
  }
}

export const WantToGoButton = ({ article }: Props) => {
  const isSaved = useSyncExternalStore(
    subscribe,
    () => readSavedArticles().some((saved) => saved.slug === article.slug),
    () => false,
  )

  const toggleSaved = () => {
    const savedArticles = readSavedArticles()
    const nextSaved = isSaved
      ? savedArticles.filter((saved) => saved.slug !== article.slug)
      : [
          { ...article, savedAt: new Date().toISOString() },
          ...savedArticles.filter((saved) => saved.slug !== article.slug),
        ]

    writeSavedArticles(nextSaved)
  }

  return (
    <button
      type="button"
      className={`want-to-go-button${isSaved ? " want-to-go-button--saved" : ""}`}
      aria-pressed={isSaved}
      onClick={toggleSaved}
    >
      <span className="want-to-go-button__icon" aria-hidden="true">
        {isSaved ? "✓" : "+"}
      </span>
      <span>{isSaved ? "行きたい保存済み" : "行きたいに保存"}</span>
    </button>
  )
}
