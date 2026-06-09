import Link from "next/link"

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
  ariaLabel?: string
}

export const Breadcrumb = ({ items, ariaLabel = "パンくずリスト" }: Props) => (
  <nav className="breadcrumb" aria-label={ariaLabel}>
    <ol className="breadcrumb__list">
      {items.map((item, i) =>
        item.href ? (
          <li key={i} className="breadcrumb__item">
            <Link href={item.href}>{item.label}</Link>
          </li>
        ) : (
          <li key={i} className="breadcrumb__item breadcrumb__item--current">
            {item.label}
          </li>
        ),
      )}
    </ol>
  </nav>
)
