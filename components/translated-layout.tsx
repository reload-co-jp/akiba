import { jsonLdScript } from "lib/json-ld"
import Link from "next/link"
import Script from "next/script"
import { absoluteUrl, siteDescriptionEn, siteNameEn, siteUrl } from "lib/site"
import { LanguageProvider } from "components/language-provider"
import AdsenseDisplayAd from "components/adsense-display-ad"
import { AdsenseVignetteCleanup } from "components/adsense-vignette-cleanup"
import { RouteAdModal } from "components/route-ad-modal"
import { getAllArticles, type TranslatedLang } from "lib/articles"
import { notoSansJP } from "lib/fonts"

const googleAnalyticsId = "G-ZJM8E54KXG"
const isProduction = process.env.NODE_ENV === "production"
const copy = {
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    description: siteDescriptionEn,
    recommended: "Recommended",
    navLabel: "Site navigation",
    company: "Company",
  },
  zh: {
    htmlLang: "zh-Hans",
    ogLocale: "zh_CN",
    description: "秋叶原娱乐资讯指南——东京电器街的活动、店铺与文化。",
    recommended: "推荐",
    navLabel: "网站导航",
    company: "公司",
  },
} satisfies Record<TranslatedLang, Record<string, string>>

/** /en/ と /zh/ のルートレイアウト。 */
export const createTranslatedLayout = (lang: TranslatedLang) => {
  const t = copy[lang]
  const recommendedLinks = getAllArticles()
    .filter((a) => a[lang])
    .slice(0, 5)
    .map((a) => ({
      href: `/${lang}/articles/${a.slug}/`,
      title: a[lang]!.title,
    }))

  const metadata = {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteNameEn,
      template: `%s | ${siteNameEn}`,
    },
    description: t.description,
    openGraph: {
      siteName: siteNameEn,
      locale: t.ogLocale,
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

  const Layout = ({ children }: { children: React.ReactNode }) => {
    const siteJsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: siteNameEn,
        alternateName: "アキバLive",
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteNameEn,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/apple-icon.png"),
      },
    ]

    return (
      <html lang={t.htmlLang} className={notoSansJP.variable}>
        <head>
          <link
            href="/llms.txt"
            rel="alternate"
            title="Akiba Live LLM index"
            type="text/markdown"
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdScript(siteJsonLd) }}
          />
        </head>
        <body>
          <LanguageProvider>
            <AdsenseVignetteCleanup />
            <RouteAdModal links={recommendedLinks} heading={t.recommended} />
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
                    width="195"
                    height="48"
                  />
                </Link>
                <nav className="site-header__nav" aria-label={t.navLabel}>
                  <Link href="/">日本語</Link>
                </nav>
              </div>
            </header>
            <main
              style={{
                background: "transparent",
                minHeight: "calc(100dvh - 8.5rem)",
                padding: "1rem 1rem 4rem",
              }}
            >
              {children}
              <AdsenseDisplayAd />
            </main>
            <footer className="site-footer">
              <div style={{ margin: "0 auto", maxWidth: "1080px" }}>
                <p>
                  &copy; Akiba Live /{" "}
                  <a
                    href="https://reload.co.jp"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {t.company}
                  </a>
                </p>
              </div>
            </footer>
          </LanguageProvider>
        </body>
      </html>
    )
  }

  return { metadata, Layout }
}
