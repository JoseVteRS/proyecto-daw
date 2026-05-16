export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {}
  }

  return Object.fromEntries(
    cookieHeader.split(";").flatMap((cookie) => {
      const separatorIndex = cookie.indexOf("=")

      if (separatorIndex === -1) {
        return []
      }

      const key = cookie.slice(0, separatorIndex).trim()
      const value = cookie.slice(separatorIndex + 1).trim()

      return [[key, decodeURIComponent(value)]]
    }),
  )
}
