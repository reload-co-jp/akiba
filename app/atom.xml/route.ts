import { buildAtomFeedXml, feedResponse } from "lib/feeds"

export const dynamic = "force-static"

export const GET = () => feedResponse(buildAtomFeedXml())
