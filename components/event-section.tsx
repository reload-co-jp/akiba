import type { ReactNode } from "react"

type Props = {
  id: string
  kicker?: string
  title: ReactNode
  children: ReactNode
}

export const EventSection = ({ id, kicker, title, children }: Props) => (
  <section style={{ margin: "0 0 2.5rem" }} aria-labelledby={id}>
    <div
      style={{
        borderBottom: "1px solid rgba(96, 120, 111, 0.16)",
        marginBottom: "1rem",
        paddingBottom: "0.5rem",
      }}
    >
      {kicker && (
        <p
          style={{
            color: "#b94a3a",
            fontSize: "0.75rem",
            fontWeight: "700",
            margin: "0 0 0.25rem",
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </p>
      )}
      <h2 id={id} className="today-section__title">
        {title}
      </h2>
    </div>
    {children}
  </section>
)
