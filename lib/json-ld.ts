/**
 * Serialise a value for embedding in a <script type="application/ld+json"> tag.
 *
 * JSON.stringify on its own is not safe here: it leaves "<" untouched, so a
 * string containing "</script>" would close the tag early and let the rest of
 * the value be parsed as markup. That used to be theoretical when every spot
 * was hand-written, but spot names now come from OpenStreetMap, which anyone
 * can edit.
 *
 * Escaping "<" as < is valid JSON and parses back to the same string, so
 * consumers see the original value.
 */
export const jsonLdScript = (data: unknown): string =>
  JSON.stringify(data).replace(/</g, "\\u003c")
