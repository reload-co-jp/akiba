"use client"

import { useLang } from "./language-provider"

export function LanguageToggle() {
  const { lang, setLang } = useLang()
  return (
    <button
      className="language-toggle"
      onClick={() => setLang(lang === "ja" ? "en" : "ja")}
      aria-label={lang === "ja" ? "Switch to English" : "日本語に切替"}
    >
      {lang === "ja" ? "EN" : "JP"}
    </button>
  )
}
