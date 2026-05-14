"use client"

import { createContext, useContext, useState } from "react"
import type { Lang } from "lib/articles"

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue>({ lang: "ja", setLang: () => {} })

const getStoredLang = (): Lang => {
  if (typeof window === "undefined") return "ja"
  return localStorage.getItem("lang") === "en" ? "en" : "ja"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getStoredLang)

  const setLang = (next: Lang) => {
    setLangState(next)
    localStorage.setItem("lang", next)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
