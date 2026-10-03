import { getAllArticles } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { getVenueLinksFor, landingMetadata } from "lib/event-landings"
import { Breadcrumb } from "components/breadcrumb"
import { LandingLinks } from "components/event-landing"

const PATH = "/events/venue/"
const TITLE = "秋葉原の会場別イベント一覧"
const DESCRIPTION = "秋葉原のイベント会場・ショップごとに、開催中・開催予定のイベントをまとめています。会場名から探せます（カッコ内は掲載イベント数）。"

export const metadata = landingMetadata(PATH, TITLE, DESCRIPTION, ["秋葉原 イベント会場", "秋葉原 イベント", "秋葉原 ポップアップ 会場"])

const Page = () => {
  const events = getAllArticles().filter((a) => a.event) as Parameters<typeof getVenueLinksFor>[0]
  const items = getVenueLinksFor(events)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "会場別イベント", item: absoluteUrl(PATH) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: TITLE,
      url: absoluteUrl(PATH),
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${item.label}のイベント`,
        url: absoluteUrl(item.href),
      })),
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <div style={{ margin: "0 auto", maxWidth: "1080px" }}>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "イベント", href: "/events/" },
            { label: "会場別イベント" },
          ]}
        />
        <header style={{ margin: "0 0 1.5rem", padding: "2.5rem 0 0.875rem" }}>
          <p className="events-page__kicker">Events by Venue</p>
          <h1 style={{ color: "#24312f", fontSize: "1.5rem", fontWeight: "700", lineHeight: "1.4", margin: 0 }}>
            {TITLE}
          </h1>
        </header>
        <p className="today-lead">{DESCRIPTION}</p>
        <LandingLinks items={items} />
      </div>
    </>
  )
}

export default Page
