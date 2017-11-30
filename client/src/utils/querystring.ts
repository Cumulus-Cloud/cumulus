
export default function querystring(queries: Record<string, string | undefined>): string {
  const querystrings = Object.keys(queries).filter(key => !!queries[key]).map(key => `${key}=${encodeURI(queries[key]!)}`)
  if (querystrings.length > 0) {
    return `?${querystrings.join("&")}`
  } else {
    return ""
  }
}
