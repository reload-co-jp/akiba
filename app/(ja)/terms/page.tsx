import Link from "next/link"

export const metadata = {
  title: "利用規約",
  description: "アキバLiveの利用規約です。",
  alternates: { canonical: "/terms/" },
  openGraph: {
    title: "利用規約 | アキバLive",
    description: "アキバLiveの利用規約です。",
    url: "/terms/",
    type: "website",
  },
}

const Page = () => {
  return (
    <article className="about-page">
      <header className="about-page__header">
        <p className="about-page__kicker">Terms of Service</p>
        <h1 className="about-page__title">利用規約</h1>
      </header>

      <section className="about-section">
        <p>
          本利用規約（以下「本規約」）は、株式会社リロード（以下「当社」）が運営するメディア「アキバLive」（以下「本サービス」）の利用条件を定めるものです。本サービスをご利用いただくことで、本規約に同意したものとみなします。
        </p>
      </section>

      <section className="about-section" aria-labelledby="terms-content-title">
        <h2 id="terms-content-title">コンテンツの著作権</h2>
        <p>
          本サービスに掲載されている記事・画像・その他コンテンツの著作権は、当社または正当な権利を有する第三者に帰属します。無断での複製・転載・改変・二次利用を禁じます。
        </p>
        <p>
          引用は著作権法の範囲内に限り認めます。引用の際は出典（サイト名・記事URL）を明記してください。
        </p>
      </section>

      <section className="about-section" aria-labelledby="terms-prohibited-title">
        <h2 id="terms-prohibited-title">禁止事項</h2>
        <p>本サービスの利用にあたり、以下の行為を禁じます。</p>
        <ul>
          <li>当社または第三者の著作権・肖像権・名誉・プライバシーを侵害する行為</li>
          <li>本サービスのコンテンツを無断で複製・転載・商業利用する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>法令または公序良俗に反する行為</li>
        </ul>
      </section>

      <section className="about-section" aria-labelledby="terms-link-title">
        <h2 id="terms-link-title">リンクについて</h2>
        <p>
          本サービスへのリンクは原則として自由です。ただし、フレーム内表示・内容を誤認させるリンクはお断りします。
        </p>
        <p>
          本サービスに掲載している外部リンクについて、当社はリンク先の内容・正確性を保証するものではありません。
        </p>
      </section>

      <section className="about-section" aria-labelledby="terms-disclaimer-title">
        <h2 id="terms-disclaimer-title">免責事項</h2>
        <p>
          本サービスに掲載する情報は正確性を期していますが、内容の完全性・最新性・有用性を保証するものではありません。掲載情報に基づいて生じた損害について、当社は責任を負いません。
        </p>
        <p>
          イベント情報・店舗情報は変更・中止になる場合があります。最新情報は各公式サイトをご確認ください。
        </p>
      </section>

      <section className="about-section" aria-labelledby="terms-change-title">
        <h2 id="terms-change-title">規約の変更</h2>
        <p>
          当社は必要に応じて本規約を変更できるものとします。変更後の規約は本ページに掲載した時点で効力を生じます。
        </p>
      </section>

      <section className="about-section" aria-labelledby="terms-operator-title">
        <h2 id="terms-operator-title">運営者</h2>
        <p>
          株式会社リロード<br />
          <a href="https://reload.co.jp" rel="noopener noreferrer" target="_blank">
            https://reload.co.jp
          </a>
        </p>
      </section>

      <nav aria-label="関連ページ" style={{ marginTop: "2rem", fontSize: ".875rem" }}>
        <Link href="/privacy/">プライバシーポリシー</Link>
        {" / "}
        <Link href="/about/">このサイトについて</Link>
      </nav>
    </article>
  )
}

export default Page
