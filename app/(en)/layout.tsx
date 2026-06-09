import Link from "next/link"
import Script from "next/script"
import { absoluteUrl, siteDescriptionEn, siteNameEn, siteUrl } from "lib/site"
import { LanguageProvider } from "components/language-provider"
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
      logo: absoluteUrl("/icon.svg"),
    },
  ]

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body>
        <LanguageProvider>
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
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6542845006087970"
                strategy="afterInteractive"
                crossOrigin="anonymous"
              />
            </>
          )}
          <header className="site-header">
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
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <div className="site-footer__inner">
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
