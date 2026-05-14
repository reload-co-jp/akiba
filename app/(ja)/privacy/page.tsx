import Link from "next/link"

export const metadata = {
  title: "プライバシーポリシー",
  description: "アキバLiveのプライバシーポリシーです。",
  alternates: { canonical: "/privacy/" },
  openGraph: {
    title: "プライバシーポリシー | アキバLive",
    description: "アキバLiveのプライバシーポリシーです。",
    url: "/privacy/",
    type: "website",
  },
}

const Page = () => {
  return (
    <article className="about-page">
      <header className="about-page__header">
        <p className="about-page__kicker">Privacy Policy</p>
        <h1 className="about-page__title">プライバシーポリシー</h1>
      </header>

      <section className="about-section">
        <p>
          株式会社リロード（以下「当社」）は、「アキバLive」（以下「本サービス」）における個人情報の取り扱いについて、以下のとおり定めます。
        </p>
      </section>

      <section className="about-section" aria-labelledby="privacy-collect-title">
        <h2 id="privacy-collect-title">収集する情報</h2>
        <p>本サービスでは、以下の情報を自動的に収集する場合があります。</p>
        <ul>
          <li>アクセス日時・閲覧ページ・参照元URL・ブラウザ情報・IPアドレスなどのアクセスログ</li>
          <li>Cookieおよびこれに類する技術を通じた識別情報</li>
        </ul>
        <p>氏名・メールアドレスなどの個人を直接特定できる情報は収集していません。</p>
      </section>

      <section className="about-section" aria-labelledby="privacy-analytics-title">
        <h2 id="privacy-analytics-title">Google Analyticsの利用</h2>
        <p>
          本サービスはアクセス解析のためGoogle Analytics（Google LLC）を使用しています。Google AnalyticsはCookieを使用してアクセス情報を収集します。収集されたデータはGoogleのプライバシーポリシーに基づいて管理されます。
        </p>
        <p>
          Google Analyticsによるデータ収集を無効にしたい場合は、
          <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener noreferrer" target="_blank">
            Google Analyticsオプトアウトアドオン
          </a>
          をご利用ください。
        </p>
      </section>

      <section className="about-section" aria-labelledby="privacy-ads-title">
        <h2 id="privacy-ads-title">広告配信について</h2>
        <p>
          本サービスはGoogle AdSense（Google LLC）による広告を掲載しています。Google AdSenseはCookieを使用して、ユーザーの興味に基づいた広告を表示します。
        </p>
        <p>
          広告のパーソナライズはGoogleの広告設定ページで変更できます。また、
          <a href="https://optout.aboutads.info/" rel="noopener noreferrer" target="_blank">
            aboutads.info
          </a>
          からオプトアウトが可能です。
        </p>
      </section>

      <section className="about-section" aria-labelledby="privacy-swg-title">
        <h2 id="privacy-swg-title">Google ニュースとの連携</h2>
        <p>
          本サービスはGoogleのReader Revenue Manager（Subscribe with Google）を利用しています。これによりGoogleはCookieを使用して本サービスの閲覧状況を把握する場合があります。詳細はGoogleのプライバシーポリシーをご確認ください。
        </p>
      </section>

      <section className="about-section" aria-labelledby="privacy-cookie-title">
        <h2 id="privacy-cookie-title">Cookieについて</h2>
        <p>
          本サービスはCookieを使用しています。ブラウザの設定でCookieを無効にすることができますが、一部機能が正常に動作しない場合があります。
        </p>
      </section>

      <section className="about-section" aria-labelledby="privacy-third-party-title">
        <h2 id="privacy-third-party-title">第三者への情報提供</h2>
        <p>
          当社は法令に基づく場合を除き、収集した情報を第三者に提供しません。
        </p>
      </section>

      <section className="about-section" aria-labelledby="privacy-change-title">
        <h2 id="privacy-change-title">プライバシーポリシーの変更</h2>
        <p>
          当社は必要に応じて本ポリシーを変更できるものとします。変更後のポリシーは本ページに掲載した時点で効力を生じます。
        </p>
      </section>

      <section className="about-section" aria-labelledby="privacy-contact-title">
        <h2 id="privacy-contact-title">お問い合わせ</h2>
        <p>
          個人情報の取り扱いに関するお問い合わせは、運営会社までご連絡ください。
        </p>
        <p>
          株式会社リロード<br />
          <a href="https://reload.co.jp" rel="noopener noreferrer" target="_blank">
            https://reload.co.jp
          </a>
        </p>
      </section>

      <nav aria-label="関連ページ" style={{ marginTop: "2rem", fontSize: ".875rem" }}>
        <Link href="/terms/">利用規約</Link>
        {" / "}
        <Link href="/about/">このサイトについて</Link>
      </nav>
    </article>
  )
}

export default Page
