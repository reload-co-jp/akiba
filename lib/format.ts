export const fmtRange = (s: string, e: string, sep = "〜") =>
  `${s.slice(5).replace("-", "/")} ${sep} ${e.slice(5).replace("-", "/")}`
