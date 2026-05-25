import { type Pool } from "pg"

import { isUniqueViolation } from "../../db/postgres-errors.js"
import { pool } from "../../db.js"
import { AppError } from "../../http/app-error.js"
import { type CreateUserData, type UsersRepository, type UserWithPasswordRecord } from "./users.service.js"
import { type UserRecord } from "./users.mapper.js"

type UserRow = {
  id: string
  role_id: number
  name: string
  email: string
  created_at: Date
}

type UserWithPasswordRow = UserRow & {
  password_hash: string
}

export class PostgresUsersRepository implements UsersRepository {
  constructor(private readonly database: Pick<Pool, "query"> = pool) {}

  async create(data: CreateUserData): Promise<UserRecord> {
    try {
      const result = await this.database.query<UserRow>(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, role_id, name, email, created_at`,
        [data.name, data.email, data.passwordHash],
      )

      return toUserRecord(result.rows[0])
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError("EMAIL_ALREADY_REGISTERED")
      }

      throw error
    }
  }

  async findByEmail(email: string): Promise<UserWithPasswordRecord | null> {
    const result = await this.database.query<UserWithPasswordRow>(
      `SELECT id, role_id, name, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [email],
    )

    const row = result.rows[0]

    if (!row) {
      return null
    }

    return {
      ...toUserRecord(row),
      passwordHash: row.password_hash,
    }
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.database.query<UserRow>(
      `SELECT id, role_id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [id],
    )

    const row = result.rows[0]

    if (!row) {
      return null
    }

    return toUserRecord(row)
  }
}

function toUserRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    roleId: row.role_id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
  }
}
