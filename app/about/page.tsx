export const metadata = {
  title: "このサイトについて",
  description:
    "アキバLiveは、現地にいるからこそ気づく秋葉原の違和感を見つけ、見て、調べて、記録するメディアです。",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "このサイトについて | アキバLive",
    description:
      "アキバLiveは、現地にいるからこそ気づく秋葉原の違和感を見つけ、見て、調べて、記録するメディアです。",
    url: "/about/",
    type: "website",
  },
}

const Page = () => {
  return (
    <article className="about-page">
      <header className="about-page__header">
        <p className="about-page__kicker">About Akiba Live</p>
        <h1 className="about-page__title">このサイトについて</h1>
        <p className="about-page__lead">
          秋葉原の「情報になっていない情報」を拾い上げ、見て、調べて、記録するメディアです。
        </p>
      </header>

      <section className="about-section" aria-labelledby="about-media-title">
        <h2 id="about-media-title">このメディアについて</h2>
        <p>
          秋葉原に拠点を置いていると、この街には「情報になっていない情報」が大量にあることに気づきます。
        </p>
        <ul>
          <li>新しくできた店。</li>
          <li>いつの間にか消えた看板。</li>
          <li>謎に混んでいる場所。</li>
          <li>誰も説明していない文化や習慣。</li>
        </ul>
        <p>
          でも、それらの多くはニュースにもならず、記録もされず、流れていきます。
          このメディアは、そうした“取りこぼされている秋葉原”を拾い上げるために立ち上げました。
        </p>
      </section>

      <section className="about-section" aria-labelledby="about-concept-title">
        <h2 id="about-concept-title">コンセプト</h2>
        <p className="about-section__statement">
          秋葉原の「違和感」を見つけて、ちゃんと調べる。
        </p>
        <ul>
          <li>なぜこの店はここにあるのか。</li>
          <li>なぜこの場所だけ異様に人がいるのか。</li>
          <li>なぜこの文化は残っているのか。</li>
          <li>なぜこの噂は広まっているのか。</li>
        </ul>
        <p>
          現地にいるからこそ気づく違和感を起点に、実際に見て、調べて、必要なら検証して、コンテンツにします。
        </p>
      </section>

      <section className="about-section" aria-labelledby="about-topics-title">
        <h2 id="about-topics-title">扱う内容</h2>
        <ul>
          <li>新規店舗・閉店情報。</li>
          <li>秋葉原の小ネタ・謎・噂の検証。</li>
          <li>街の変化の記録、定点観測。</li>
          <li>現場視点のレビューや体験。</li>
          <li>少し変わった視点からのカルチャー解説。</li>
        </ul>
      </section>

      <section
        className="about-section"
        aria-labelledby="about-operation-title"
      >
        <h2 id="about-operation-title">運営について</h2>
        <p>
          本メディアは、秋葉原にオフィス・コワーキングスペースを構える株式会社リロードが運営しています。
        </p>
        <p>
          日常的にこの街にいるからこそ拾える違和感を、そのままにせず、コンテンツとして残していきます。
        </p>
      </section>
    </article>
  )
}

export default Page
