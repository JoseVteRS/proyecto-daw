import { Router } from "express"

import {
  authCookieName,
  getAuthCookieOptions,
  getRefreshTokenCookieOptions,
  refreshTokenCookieName,
} from "../../auth-token.js"

export function createLogoutRouter() {
  const router = Router()

  router.post("/logout", (_request, response) => {
    response
      .set("Cache-Control", "no-store")
      .clearCookie(authCookieName, getAuthCookieOptions())
      .clearCookie(refreshTokenCookieName, getRefreshTokenCookieOptions())
      .status(204)
      .send()
  })

  return router
}

export const logoutRouter = createLogoutRouter()
