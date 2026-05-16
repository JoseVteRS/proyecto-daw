import { type RequestHandler } from "express"

import { authCookieName, verifyAuthToken, type AuthTokenPayload } from "./auth-token.js"
import { parseCookies } from "./cookies.js"

declare global {
  namespace Express {
    interface Request {
      session?: AuthTokenPayload
    }
  }
}

export const requireSession: RequestHandler = async (request, response, next) => {
  const cookies = parseCookies(request.headers.cookie)
  const token = cookies[authCookieName]

  if (!token) {
    response.status(401).json({ error: "SESSION_REQUIRED" })
    return
  }

  try {
    request.session = await verifyAuthToken(token)
    next()
  } catch (error) {
    response.status(401).json({ error: "SESSION_REQUIRED" })
  }
}
