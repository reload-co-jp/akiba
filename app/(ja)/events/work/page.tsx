import { getAllArticles } from "lib/articles"
import { absoluteUrl } from "lib/site"
import { jsonLdScript } from "lib/json-ld"
import { getWorkLinksFor, landingMetadata } from "lib/event-landings"
import { Breadcrumb } from "components/breadcrumb"
import { LandingLinks } from "components/event-landing"

const PATH = "/events/work/"
const TITLE = "秋葉原の作品別イベント一覧"
const DESCRIPTION = "アニメ・ゲーム・アイドルなど作品ごとに、秋葉原で開催中・開催予定のコラボカフェやポップアップをまとめています（カッコ内は掲載イベント数）。"

export const metadata = landingMetadata(PATH, TITLE, DESCRIPTION, ["秋葉原 コラボ イベント", "秋葉原 アニメ イベント", "秋葉原 コラボカフェ"])

const Page = () => {
  const events = getAllArticles().filter((a) => a.event) as Parameters<typeof getWorkLinksFor>[0]
  const items = getWorkLinksFor(events)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "イベント", item: absoluteUrl("/events/") },
        { "@type": "ListItem", position: 3, name: "作品別イベント", item: absoluteUrl(PATH) },
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
            { label: "作品別イベント" },
          ]}
        />
        <header style={{ margin: "0 0 1.5rem", padding: "2.5rem 0 0.875rem" }}>
          <p className="events-page__kicker">Events by Title</p>
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
