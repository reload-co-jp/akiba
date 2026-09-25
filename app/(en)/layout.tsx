import Link from "next/link"
import Script from "next/script"
import { absoluteUrl, siteDescriptionEn, siteNameEn, siteUrl } from "lib/site"
import { LanguageProvider } from "components/language-provider"
import { AdsenseVignetteCleanup } from "components/adsense-vignette-cleanup"
import { notoSansJP } from "lib/fonts"
import "../reset.css"

const googleAnalyticsId = "G-ZJM8E54KXG"
const isProduction = process.env.NODE_ENV === "production"

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteNameEn,
    template: `%s | ${siteNameEn}`,
  },
  description: siteDescriptionEn,
  openGraph: {
    siteName: siteNameEn,
    locale: "en_US",
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

const EnLayout = ({ children }: { children: React.ReactNode }) => {
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
    <html lang="en" className={notoSansJP.variable}>
      <head>
        <link
          href="/llms.txt"
          rel="alternate"
          title="Akiba Live LLM index"
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
              <nav className="site-header__nav" aria-label="Site navigation">
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
                  Company
                </a>
              </p>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  )
}

export default EnLayout
