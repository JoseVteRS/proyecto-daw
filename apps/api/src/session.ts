import { Router } from "express"
import { type SessionResponse } from "@proyecto-daw/shared"

import { authCookieName, refreshTokenCookieName, verifyAuthToken } from "./auth-token.js"

export const sessionRouter = Router()

sessionRouter.get("/session", async (request, response, next) => {
  const cookies = parseCookies(request.headers.cookie)
  const token = cookies[authCookieName]
  const refreshToken = cookies[refreshTokenCookieName]

  if (!token || !refreshToken) {
    response.status(200).json(null)
    return
  }

  try {
    await verifyAuthToken(token)

    const body: SessionResponse = {
      token,
      refresh_token: refreshToken,
    }

    response.status(200).json(body)
  } catch (error) {
    response.status(200).json(null)
  }
})

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
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
