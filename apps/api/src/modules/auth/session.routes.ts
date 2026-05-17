import { Router } from "express"

import { authCookieName, refreshTokenCookieName } from "../../auth-token.js"
import { parseCookies } from "../../cookies.js"
import { SessionService } from "./session.service.js"

export function createSessionRouter(sessionService = new SessionService()) {
  const router = Router()

  router.get("/session", async (request, response) => {
    const cookies = parseCookies(request.headers.cookie)
    const body = await sessionService.getSession({
      token: cookies[authCookieName],
      refreshToken: cookies[refreshTokenCookieName],
    })

    response.set("Cache-Control", "no-store").status(200).json(body)
  })

  return router
}

export const sessionRouter = createSessionRouter()
