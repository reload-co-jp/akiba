import Link from "next/link"
import { Title } from "components/elements/layout"
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
        <header
          style={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e7eb",
            boxShadow: "0 2px 10px rgba(17, 24, 39, 0.04)",
            padding: ".5rem 1rem",
            position: "relative",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <Title style={{ color: "#111827" }}>アキバLive</Title>
          </Link>
        </header>
        <main
          style={{
            background: "#f6f7f9",
            minHeight: "calc(100dvh - 5.625rem)",
            padding: "1rem",
          }}
        >
          {children}
        </main>
        <footer
          style={{
            backgroundColor: "#fff",
            borderTop: "1px solid #e5e7eb",
            boxShadow: "0 -2px 10px rgba(17, 24, 39, 0.04)",
            color: "#4b5563",
            fontSize: ".75rem",
            padding: "1rem",
          }}
        >
          <p>&copy; アキバLive</p>
        </footer>
      </body>
    </html>
  )
}
export default RootLayout
