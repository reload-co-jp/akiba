export const fmtRange = (s: string, e: string, sep = "〜") =>
  `${s.slice(5).replace("-", "/")} ${sep} ${e.slice(5).replace("-", "/")}`

/** Trim, drop empty values, and de-duplicate while keeping first-seen order. */
export const unique = (items: Array<string | undefined>) =>
  Array.from(
    new Set(
      items
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item)),
    ),
  )
