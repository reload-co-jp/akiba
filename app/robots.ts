import type { MetadataRoute } from "next"
import { absoluteUrl, siteUrl } from "lib/site"

export const dynamic = "force-static"

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  }
}

export default robots
