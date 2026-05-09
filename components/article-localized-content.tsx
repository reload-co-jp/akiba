"use client"

import { useLang } from "./language-provider"

type Props = {
  ja: { title: string; contentHtml: string }
  en?: { title: string; contentHtml: string }
  hasTranslation: boolean
  publishedAt: string
  publishedAtDisplay: string
}

export function ArticleLocalizedContent({ ja, en, hasTranslation, publishedAt, publishedAtDisplay }: Props) {
  const { lang, setLang } = useLang()
  const active = lang === "en" && en ? en : ja

  return (
    <>
      {hasTranslation && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: ".75rem" }}>
          <button
            className="language-toggle"
            onClick={() => setLang(lang === "ja" ? "en" : "ja")}
            aria-label={lang === "ja" ? "Switch to English" : "日本語に切替"}
          >
            {lang === "ja" ? "Read in English" : "日本語で読む"}
          </button>
        </div>
      )}
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#24312f",
          margin: "0 0 .5rem",
          lineHeight: "1.4",
        }}
      >
        {active.title}
      </h1>
      <time
        dateTime={publishedAt}
        style={{
          fontSize: ".75rem",
          color: "#8a6f63",
          display: "block",
          marginBottom: "1.5rem",
        }}
      >
        {publishedAtDisplay}
      </time>
    </>
  )
}

export function ArticleLocalizedBody({ ja, en }: Pick<Props, "ja" | "en">) {
  const { lang } = useLang()
  const active = lang === "en" && en ? en : ja

  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: active.contentHtml }}
    />
  )
}
