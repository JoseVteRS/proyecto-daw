import { Router } from "express"
import {
  createCategoryInputSchema,
  updateCategoryInputSchema,
  type CategoryResponse,
} from "@proyecto-daw/shared"

import { requireSession } from "./auth-middleware.js"
import { pool } from "./db.js"
import { isInvalidUuid, isUniqueViolation } from "./db/postgres-errors.js"

export const categoriesRouter = Router()

const adminRoleId = 2

categoriesRouter.post("/", requireSession, async (request, response, next) => {
  const parsedInput = createCategoryInputSchema.safeParse(request.body)

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
      user_id: string
      name: string
      description: string | null
      color: string | null
      created_at: Date
      updated_at: Date
    }>(
      `INSERT INTO categories (user_id, name, description, color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, description, color, created_at, updated_at`,
      [
        request.session!.userId,
        parsedInput.data.name,
        parsedInput.data.description ?? null,
        parsedInput.data.color ?? null,
      ],
    )

    const category = result.rows[0]
    const body: CategoryResponse = {
      category: {
        id: category.id,
        userId: category.user_id,
        name: category.name,
        description: category.description,
        color: category.color,
        createdAt: category.created_at.toISOString(),
        updatedAt: category.updated_at.toISOString(),
      },
    }

    response.status(201).json(body)
  } catch (error) {
    if (isUniqueViolation(error)) {
      response.status(409).json({ error: "CATEGORY_ALREADY_EXISTS" })
      return
    }

    next(error)
  }
})

categoriesRouter.patch("/:id", requireSession, async (request, response, next) => {
  const parsedInput = updateCategoryInputSchema.safeParse(request.body)

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
      user_id: string
      name: string
      description: string | null
      color: string | null
      created_at: Date
      updated_at: Date
    }>(
      `UPDATE categories
       SET
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         color = COALESCE($4, color)
       WHERE id = $1
         AND (user_id = $5 OR $6 = $7)
       RETURNING id, user_id, name, description, color, created_at, updated_at`,
      [
        request.params.id,
        parsedInput.data.name,
        parsedInput.data.description,
        parsedInput.data.color,
        request.session!.userId,
        request.session!.roleId,
        adminRoleId,
      ],
    )

    const category = result.rows[0]

    if (!category) {
      response.status(404).json({ error: "CATEGORY_NOT_FOUND" })
      return
    }

    const body: CategoryResponse = {
      category: {
        id: category.id,
        userId: category.user_id,
        name: category.name,
        description: category.description,
        color: category.color,
        createdAt: category.created_at.toISOString(),
        updatedAt: category.updated_at.toISOString(),
      },
    }

    response.status(200).json(body)
  } catch (error) {
    if (isUniqueViolation(error)) {
      response.status(409).json({ error: "CATEGORY_ALREADY_EXISTS" })
      return
    }

    if (isInvalidUuid(error)) {
      response.status(400).json({ error: "INVALID_CATEGORY_ID" })
      return
    }

    next(error)
  }
})

categoriesRouter.delete("/:id", requireSession, async (request, response, next) => {
  try {
    const result = await pool.query<{ id: string }>(
      `DELETE FROM categories
       WHERE id = $1
         AND (user_id = $2 OR $3 = $4)
       RETURNING id`,
      [request.params.id, request.session!.userId, request.session!.roleId, adminRoleId],
    )

    if (!result.rows[0]) {
      response.status(404).json({ error: "CATEGORY_NOT_FOUND" })
      return
    }

    response.status(204).send()
  } catch (error) {
    if (isInvalidUuid(error)) {
      response.status(400).json({ error: "INVALID_CATEGORY_ID" })
      return
    }

    next(error)
  }
})

