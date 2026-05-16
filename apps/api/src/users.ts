import {
  loginUserInputSchema,
  registerUserInputSchema,
  type LoginUserResponse,
  type RegisterUserResponse,
} from "@proyecto-daw/shared"
import { Router } from "express"

import {
  authCookieName,
  createAuthToken,
  createRefreshToken,
  getAuthCookieOptions,
  getRefreshTokenCookieOptions,
  refreshTokenCookieName,
} from "./auth-token.js"
import { pool } from "./db.js"
import { hashPassword, verifyPassword } from "./password.js"
import { authRateLimit } from "./security.js"

export const usersRouter = Router()

usersRouter.post("/register", authRateLimit, async (request, response, next) => {
  const parsedInput = registerUserInputSchema.safeParse(request.body)

  if (!parsedInput.success) {
    response.status(400).json({
      error: "VALIDATION_ERROR",
      issues: parsedInput.error.issues,
    })
    return
  }

  try {
    const passwordHash = await hashPassword(parsedInput.data.password)
    const result = await pool.query<{
      id: string
      role_id: number
      name: string
      email: string
      created_at: Date
    }>(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, role_id, name, email, created_at`,
      [parsedInput.data.name, parsedInput.data.email, passwordHash],
    )

    const user = result.rows[0]
    const body: RegisterUserResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
        createdAt: user.created_at.toISOString(),
      },
    }

    response.status(201).json(body)
  } catch (error) {
    if (isUniqueViolation(error)) {
      response.status(409).json({ error: "EMAIL_ALREADY_REGISTERED" })
      return
    }

    next(error)
  }
})

usersRouter.post("/login", authRateLimit, async (request, response, next) => {
  const parsedInput = loginUserInputSchema.safeParse(request.body)

  if (!parsedInput.success) {
    response.status(400).json({
      error: "VALIDATION_ERROR",
      issues: parsedInput.error.issues,
    })
    return
  }

  try {
    const result = await pool.query<{
      id: string
      role_id: number
      name: string
      email: string
      password_hash: string
      created_at: Date
    }>(
      `SELECT id, role_id, name, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [parsedInput.data.email],
    )

    const user = result.rows[0]

    if (!user || !(await verifyPassword(parsedInput.data.password, user.password_hash))) {
      response.status(401).json({ error: "INVALID_CREDENTIALS" })
      return
    }

    const token = await createAuthToken({ userId: user.id, roleId: user.role_id })
    const refreshToken = createRefreshToken()
    const body: LoginUserResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
        createdAt: user.created_at.toISOString(),
      },
      token,
      refresh_token: refreshToken,
    }

    response
      .set("Cache-Control", "no-store")
      .cookie(authCookieName, token, getAuthCookieOptions())
      .cookie(refreshTokenCookieName, refreshToken, getRefreshTokenCookieOptions())
      .status(200)
      .json(body)
  } catch (error) {
    next(error)
  }
})

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505"
}
