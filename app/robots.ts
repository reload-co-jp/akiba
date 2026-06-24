import type { MetadataRoute } from "next"
import { absoluteUrl, siteUrl } from "lib/site"

export const dynamic = "force-static"

const robots = (): MetadataRoute.Robots => {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "Googlebot-News",
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-SearchBot",
          "anthropic-ai",
        ],
        allow: "/",
      },
    ],
    sitemap: [
      absoluteUrl("/sitemap.xml"),
      absoluteUrl("/news-sitemap.xml"),
      absoluteUrl("/news-sitemap-en.xml"),
    ],
    host: siteUrl,
  }
}

export default robots
