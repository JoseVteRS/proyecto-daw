import { loginUserInputSchema, registerUserInputSchema } from "@proyecto-daw/shared"
import { Router } from "express"

import {
  authCookieName,
  getAuthCookieOptions,
  getRefreshTokenCookieOptions,
  refreshTokenCookieName,
} from "../../auth-token.js"
import { AppError } from "../../http/app-error.js"
import { authRateLimit } from "../../security.js"
import { PostgresUsersRepository } from "./users.repository.js"
import { UsersService } from "./users.service.js"

export function createUsersRouter(usersService = new UsersService(new PostgresUsersRepository())) {
  const router = Router()

  router.post("/register", authRateLimit, async (request, response, next) => {
    const parsedInput = registerUserInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
      response.status(400).json({
        error: "VALIDATION_ERROR",
        issues: parsedInput.error.issues,
      })
      return
    }

    try {
      const body = await usersService.register(parsedInput.data)
      response.status(201).json(body)
    } catch (error) {
      if (error instanceof AppError && error.code === "EMAIL_ALREADY_REGISTERED") {
        response.status(409).json({ error: error.code })
        return
      }

      next(error)
    }
  })

  router.post("/login", authRateLimit, async (request, response, next) => {
    const parsedInput = loginUserInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
      response.status(400).json({
        error: "VALIDATION_ERROR",
        issues: parsedInput.error.issues,
      })
      return
    }

    try {
      const body = await usersService.login(parsedInput.data)

      response
        .set("Cache-Control", "no-store")
        .cookie(authCookieName, body.token, getAuthCookieOptions())
        .cookie(refreshTokenCookieName, body.refresh_token, getRefreshTokenCookieOptions())
        .status(200)
        .json(body)
    } catch (error) {
      if (error instanceof AppError && error.code === "INVALID_CREDENTIALS") {
        response.status(401).json({ error: error.code })
        return
      }

      next(error)
    }
  })

  return router
}

export const usersRouter = createUsersRouter()
