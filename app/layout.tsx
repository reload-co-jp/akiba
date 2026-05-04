import Link from "next/link"
import Script from "next/script"
import { absoluteUrl, siteDescription, siteName, siteUrl } from "lib/site"
import "./reset.css"

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

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const siteJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: absoluteUrl("/"),
      name: siteName,
      alternateName: "Akiba Live",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: siteName,
      url: absoluteUrl("/"),
      logo: absoluteUrl("/icon.svg"),
    },
  ]

  return (
    <html lang="ja">
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body>
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
          </>
        )}
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="site-header__brand">
              <img src="/images/logo.svg" alt="アキバLive" width="195" height="48" />
            </Link>
            <nav className="site-header__nav" aria-label="主要ナビゲーション">
              <Link href="/articles/">新着記事</Link>
              <Link href="/events/">開催中</Link>
              <Link href="/about/">このサイトについて</Link>
            </nav>
          </div>
        </header>
        <main className="site-main">
          {children}
        </main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <p>
              &copy; アキバLive /{" "}
              <a href="https://reload.co.jp" rel="noopener noreferrer" target="_blank">
                運営会社
              </a>
              {" / "}
              <Link href="/about/">このサイトについて</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout
