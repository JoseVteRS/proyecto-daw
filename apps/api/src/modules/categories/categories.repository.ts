import { type Pool } from "pg"

import { isInvalidUuid, isUniqueViolation } from "../../db/postgres-errors.js"
import { pool } from "../../db.js"
import { AppError } from "../../http/app-error.js"
import {
  type CategoriesRepository,
  type CreateCategoryData,
  type DeleteCategoryData,
  type UpdateCategoryData,
} from "./categories.service.js"
import { type CategoryRecord } from "./categories.mapper.js"

const adminRoleId = 2

type CategoryRow = {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string | null
  created_at: Date
  updated_at: Date
}

export class PostgresCategoriesRepository implements CategoriesRepository {
  constructor(private readonly database: Pick<Pool, "query"> = pool) {}

  async list(data: { userId: string }): Promise<CategoryRecord[]> {
    const result = await this.database.query<CategoryRow>(
      `SELECT id, user_id, name, description, color, created_at, updated_at
       FROM categories
       WHERE user_id = $1
       ORDER BY name ASC`,
      [data.userId],
    )

    return result.rows.map(toCategoryRecord)
  }

  async create(data: CreateCategoryData): Promise<CategoryRecord> {
    try {
      const result = await this.database.query<CategoryRow>(
        `INSERT INTO categories (user_id, name, description, color)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, name, description, color, created_at, updated_at`,
        [data.userId, data.name, data.description, data.color],
      )

      return toCategoryRecord(result.rows[0])
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError("CATEGORY_ALREADY_EXISTS")
      }

      throw error
    }
  }

  async update(data: UpdateCategoryData): Promise<CategoryRecord | null> {
    try {
      const result = await this.database.query<CategoryRow>(
        `UPDATE categories
         SET
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           color = COALESCE($4, color)
         WHERE id = $1
           AND (user_id = $5 OR $6 = $7)
         RETURNING id, user_id, name, description, color, created_at, updated_at`,
        [data.id, data.name, data.description, data.color, data.userId, data.roleId, adminRoleId],
      )

      const row = result.rows[0]
      return row ? toCategoryRecord(row) : null
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError("CATEGORY_ALREADY_EXISTS")
      }

      if (isInvalidUuid(error)) {
        throw new AppError("INVALID_CATEGORY_ID")
      }

      throw error
    }
  }

  async delete(data: DeleteCategoryData): Promise<boolean> {
    try {
      const result = await this.database.query<{ id: string }>(
        `DELETE FROM categories
         WHERE id = $1
           AND (user_id = $2 OR $3 = $4)
         RETURNING id`,
        [data.id, data.userId, data.roleId, adminRoleId],
      )

      return Boolean(result.rows[0])
    } catch (error) {
      if (isInvalidUuid(error)) {
        throw new AppError("INVALID_CATEGORY_ID")
      }

      throw error
    }
  }
}

function toCategoryRecord(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
