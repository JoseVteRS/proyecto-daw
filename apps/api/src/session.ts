import { Router } from "express"
import { type SessionResponse } from "@proyecto-daw/shared"

import { authCookieName, refreshTokenCookieName, verifyAuthToken } from "./auth-token.js"
import { parseCookies } from "./cookies.js"

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

