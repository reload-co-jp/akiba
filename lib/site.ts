export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://akiba.reload.co.jp"
).replace(/\/$/, "")

export const siteName = "アキバLive"

export const siteDescription =
  "秋葉原で今起きているエンタメ情報を、ニュース記事としてわかりやすく届けるメディア"

export const absoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${siteUrl}${normalizedPath}`
}
