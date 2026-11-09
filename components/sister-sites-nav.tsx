import { getSisterSites, SISTER_SITES_HEADING } from "lib/sister-sites"

// 姉妹サイト（東京の他エリア版）のイベント一覧への相互リンク
export const SisterSitesNav = ({ lang }: { lang: "ja" | "en" }) => {
  const heading = SISTER_SITES_HEADING[lang]
  return (
    <nav aria-label={heading} className="site-footer__sister">
      <p className="site-footer__sister-heading">{heading}</p>
      <ul>
        {getSisterSites("akiba").map((site) => (
          <li key={site.id}>
            <a href={site.url} title={site.name}>
              {site.label[lang]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
