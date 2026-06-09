import type { ReactNode } from "react"

type Props = {
  id: string
  kicker?: string
  title: ReactNode
  children: ReactNode
}

export const EventSection = ({ id, kicker, title, children }: Props) => (
  <section className="today-section" aria-labelledby={id}>
    <div className="today-section__header">
      {kicker && <p className="today-section__kicker">{kicker}</p>}
      <h2 id={id} className="today-section__title">
        {title}
      </h2>
    </div>
    {children}
  </section>
)
