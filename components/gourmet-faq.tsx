import { jsonLdScript } from "lib/json-ld"

export type Faq = { q: string; a: string }

/** Visible Q&A plus the matching FAQPage structured data. */
export const GourmetFaq = ({ faqs }: { faqs: Faq[] }) => {
  if (faqs.length === 0) return null
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faqLd) }}
      />
      <h2
        style={{
          color: "#24312f",
          fontSize: "1.125rem",
          fontWeight: "700",
          margin: "2rem 0 1rem",
        }}
      >
        よくある質問
      </h2>
      <dl style={{ margin: "0 0 1rem" }}>
        {faqs.map((f) => (
          <div key={f.q}>
            <dt
              style={{
                color: "#24312f",
                fontSize: "1rem",
                fontWeight: "700",
                margin: "1.25rem 0 0.375rem",
              }}
            >
              Q. {f.q}
            </dt>
            <dd
              style={{
                color: "#5c5148",
                fontSize: "0.9375rem",
                lineHeight: "1.8",
                margin: "0 0 0.75rem",
              }}
            >
              A. {f.a}
            </dd>
          </div>
        ))}
      </dl>
    </>
  )
}
