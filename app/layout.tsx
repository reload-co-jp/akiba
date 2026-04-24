import Link from "next/link"
import Script from "next/script"
import { siteUrl } from "lib/site"
import "./reset.css"

const googleAnalyticsId = "G-ZJM8E54KXG"
const isProduction = process.env.NODE_ENV === "production"

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "アキバLive",
    template: "%s | アキバLive",
  },
  description: "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア",
  openGraph: {
    siteName: "アキバLive",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@akiba_live",
  },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
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
              <a href="https://reload.co.jp" rel="noopener noreferrer" target="_blank">
                運営会社
              </a>
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
                株式会社リロード
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout
