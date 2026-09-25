import Link from "next/link"
import Script from "next/script"
import { absoluteUrl, siteDescription, siteName, siteUrl } from "lib/site"
import { LanguageProvider } from "components/language-provider"
import { AdsenseVignetteCleanup } from "components/adsense-vignette-cleanup"
import { notoSansJP } from "lib/fonts"
import "../reset.css"

const googleAnalyticsId = "G-ZJM8E54KXG"
const isProduction = process.env.NODE_ENV === "production"

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
      "application/atom+xml": "/atom.xml",
    },
  },
  openGraph: {
    siteName,
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@akiba_live",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
}

const JaLayout = ({ children }: { children: React.ReactNode }) => {
  const siteJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: siteName,
      alternateName: "Akiba Live",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: absoluteUrl("/search?q={search_term_string}"),
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteName,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/apple-icon.png"),
    },
  ]

  return (
    <html lang="ja" className={notoSansJP.variable}>
      <head>
        <link
          href="/rss.xml"
          rel="alternate"
          title="アキバLive RSS Feed"
          type="application/rss+xml"
        />
        <link
          href="/atom.xml"
          rel="alternate"
          title="アキバLive Atom Feed"
          type="application/atom+xml"
        />
        <link
          href="/llms.txt"
          rel="alternate"
          title="アキバLive LLM index"
          type="text/markdown"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
          <AdsenseVignetteCleanup />
          <Script
            src="https://news.google.com/swg/js/v1/swg-basic.js"
            strategy="afterInteractive"
          />
          <Script id="swg-basic-init" strategy="afterInteractive">
            {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAow4qbgCw:openaccess",
                clientOptions: { theme: "light", lang: "ja" },
              });
            });
          `}
          </Script>
          {isProduction && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}');
              `}
              </Script>
              <Script
                id="google-adsense"
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6542845006087970"
                strategy="afterInteractive"
                crossOrigin="anonymous"
                data-ad-frequency-hint="30s"
              />
            </>
          )}
          <header
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              borderBottom: "1px solid rgba(34, 37, 43, 0.1)",
              position: "sticky",
              top: "0",
              zIndex: "10",
            }}
          >
            <div className="site-header__inner">
              <Link href="/" className="site-header__brand">
                <img
                  src="/images/logo.png"
                  alt="アキバLive"
                  width="300"
                  height="100"
                />
              </Link>
              <div className="site-header__tagline">
                <p
                  style={{
                    color: "var(--color-pink)",
                    fontSize: "1rem",
                    fontWeight: "700",
                    marginRight: "0.625rem",
                    textTransform: "uppercase",
                  }}
                >
                  Akihabara journal
                </p>
                今日出会えるエンタメの気配を集めて配信！
              </div>
              <form action="/articles" className="site-header__search">
                <input
                  type="search"
                  name="q"
                  className="site-header__search-input"
                  placeholder="キーワードで検索（例：新店舗、イベント、ゲーム）"
                  aria-label="記事を検索"
                />
                <button
                  type="submit"
                  style={{
                    background: "var(--color-cyan)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                    flex: "0 0 auto",
                    fontSize: "0.8125rem",
                    fontWeight: "700",
                    padding: "0.5rem 1rem",
                  }}
                >
                  検索
                </button>
              </form>
              <nav className="site-header__nav" aria-label="主要ナビゲーション">
                <Link href="/events/">イベント</Link>
                <Link href="/spots/">スポット</Link>
                <Link href="/articles/">新着</Link>
              </nav>
            </div>
          </header>
          <div
            style={{ display: "flex", margin: "0 auto", maxWidth: "1280px" }}
          >
            <nav className="site-sidebar" aria-label="カテゴリナビゲーション">
              <Link href="/" className="site-sidebar__link">
                ホーム
              </Link>
              <Link href="/events/today/" className="site-sidebar__link">
                今日のイベント
              </Link>
              <Link href="/events/this-week/" className="site-sidebar__link">
                今週のイベント
              </Link>
              <Link href="/events/this-weekend/" className="site-sidebar__link">
                今週末のイベント
              </Link>
              <Link href="/events/collab-cafe/" className="site-sidebar__link">
                コラボカフェ
              </Link>
              <Link href="/events/popup/" className="site-sidebar__link">
                POPUPストア
              </Link>
              <Link href="/events/calendar/" className="site-sidebar__link">
                イベントカレンダー
              </Link>
              <Link href="/articles/" className="site-sidebar__link">
                新着記事
              </Link>
              <Link href="/akiba-today/" className="site-sidebar__link">
                今日の秋葉原
              </Link>
              <Link href="/spots/gourmet/" className="site-sidebar__link">
                秋葉原グルメ
              </Link>
              <Link href="/spots/" className="site-sidebar__link">
                観光スポット
              </Link>
              <Link href="/articles/month/" className="site-sidebar__link">
                月別アーカイブ
              </Link>
              <Link href="/about/" className="site-sidebar__link">
                このサイトについて
              </Link>
            </nav>
            <div style={{ flex: "1 1 auto", minWidth: "0" }}>
              <main
                style={{
                  background: "transparent",
                  minHeight: "calc(100dvh - 8.5rem)",
                  padding: "1rem 1rem 4rem",
                }}
              >
                {children}
              </main>
              <footer className="site-footer">
                <div style={{ margin: "0 auto", maxWidth: "1080px" }}>
                  <p>
                    &copy; アキバLive /{" "}
                    <a
                      href="https://reload.co.jp"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      運営会社
                    </a>
                    {" / "}
                    <Link href="/akiba-today/">今日の秋葉原</Link>
                    {" / "}
                    <Link href="/events/today/">今日のイベント</Link>
                    {" / "}
                    <Link href="/events/popup/">POPUPストア</Link>
                    {" / "}
                    <Link href="/events/collab-cafe/">コラボカフェ</Link>
                    {" / "}
                    <Link href="/articles/month/">月別</Link>
                    {" / "}
                    <Link href="/about/">このサイトについて</Link>
                    {" / "}
                    <Link href="/spots/">観光スポット</Link>
                    {" / "}
                    <Link href="/spots/gourmet/">秋葉原グルメ</Link>
                    {" / "}
                    <Link href="/terms/">利用規約</Link>
                    {" / "}
                    <Link href="/privacy/">プライバシーポリシー</Link>
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}

export default JaLayout
