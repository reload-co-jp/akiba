import Link from "next/link"
import { Title } from "components/elements/layout"
import "./reset.css"

export const metadata = {
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
            backgroundColor: "#333",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: ".5rem 1rem",
            position: "relative",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <Title>アキバLive</Title>
          </Link>
        </header>
        <main
          style={{
            background: "#222",
            minHeight: "calc(100dvh - 5.625rem)",
            padding: "1rem",
          }}
        >
          {children}
        </main>
        <footer
          style={{
            backgroundColor: "#333",
            boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
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
