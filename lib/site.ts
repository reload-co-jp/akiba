export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://akiba.reload.co.jp"
).replace(/\/$/, "")

export const absoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${siteUrl}${normalizedPath}`
}
