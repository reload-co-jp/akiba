import { buildRssFeedXml, feedResponse } from "lib/feeds"

export const dynamic = "force-static"

export const GET = () => feedResponse(buildRssFeedXml())
