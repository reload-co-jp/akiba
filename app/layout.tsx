import Link from "next/link"
import { siteUrl } from "lib/site"
import "./reset.css"

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
  },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="site-header__brand">
              <img src="/images/logo.svg" alt="アキバLive" width="195" height="48" />
            </Link>
            <nav className="site-header__nav" aria-label="主要ナビゲーション">
              <a href="/#home-articles">新着記事</a>
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
