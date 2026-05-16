import { Router } from "express"
import { registerUserInputSchema, type RegisterUserResponse } from "@proyecto-daw/shared"

import { pool } from "./db.js"
import { hashPassword } from "./password.js"

export const usersRouter = Router()

usersRouter.post("/register", async (request, response, next) => {
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

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505"
}
