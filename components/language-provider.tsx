"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Lang } from "lib/articles"

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const LangContext = createContext<LangContextValue>({ lang: "ja", setLang: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ja")

  useEffect(() => {
    const stored = localStorage.getItem("lang")
    if (stored === "en") setLangState("en")
  }, [])

  const setLang = (next: Lang) => {
    setLangState(next)
    localStorage.setItem("lang", next)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)
