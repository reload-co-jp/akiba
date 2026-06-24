import { buildLlmsTxt, llmsTxtResponse } from "lib/llms"

export const dynamic = "force-static"

export const GET = () => llmsTxtResponse(buildLlmsTxt())
