import { type Pool } from "pg"

import { isCheckViolation, isForeignKeyViolation } from "../../db/postgres-errors.js"
import { pool } from "../../db.js"
import { AppError } from "../../http/app-error.js"
import { type CreateEventData, type DeleteEventData, type EventsRepository, type UpdateEventData } from "./events.service.js"
import { type EventRecord } from "./events.mapper.js"

type EventRow = {
  id: string
  user_id: string
  category_id: string | null
  priority_id: number
  name: string
  description: string | null
  event_date_start: Date
  event_date_end: Date
  created_at: Date
  updated_at: Date
}

export class PostgresEventsRepository implements EventsRepository {
  constructor(private readonly database: Pick<Pool, "query"> = pool) {}

  async create(data: CreateEventData): Promise<EventRecord> {
    try {
      const result = await this.database.query<EventRow>(
        `INSERT INTO events (
           user_id,
           category_id,
           priority_id,
           name,
           description,
           event_date_start,
           event_date_end
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, user_id, category_id, priority_id, name, description, event_date_start, event_date_end, created_at, updated_at`,
        [
          data.userId,
          data.categoryId,
          data.priorityId,
          data.name,
          data.description,
          data.eventDateStart,
          data.eventDateEnd,
        ],
      )

      return toEventRecord(result.rows[0])
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new AppError("INVALID_EVENT_RELATION")
      }

      if (isCheckViolation(error)) {
        throw new AppError("INVALID_EVENT_DATE_RANGE")
      }

      throw error
    }
  }

  async list(data: { userId: string; from: Date | null; to: Date | null }): Promise<EventRecord[]> {
    const result = await this.database.query<EventRow>(
      `SELECT id, user_id, category_id, priority_id, name, description, event_date_start, event_date_end, created_at, updated_at
       FROM events
       WHERE user_id = $1
         AND ($2::timestamptz IS NULL OR event_date_end >= $2)
         AND ($3::timestamptz IS NULL OR event_date_start <= $3)
       ORDER BY event_date_start ASC`,
      [data.userId, data.from, data.to],
    )

    return result.rows.map(toEventRecord)
  }

  async update(data: UpdateEventData): Promise<EventRecord | null> {
    try {
      const result = await this.database.query<EventRow>(
        `UPDATE events
         SET category_id = COALESCE($3, category_id),
             priority_id = COALESCE($4, priority_id),
             name = COALESCE($5, name),
             description = COALESCE($6, description),
             event_date_start = COALESCE($7, event_date_start),
             event_date_end = COALESCE($8, event_date_end),
             updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, category_id, priority_id, name, description, event_date_start, event_date_end, created_at, updated_at`,
        [
          data.id,
          data.userId,
          data.categoryId ?? null,
          data.priorityId ?? null,
          data.name ?? null,
          data.description ?? null,
          data.eventDateStart ?? null,
          data.eventDateEnd ?? null,
        ],
      )

      if (result.rowCount === 0) {
        return null
      }

      return toEventRecord(result.rows[0])
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new AppError("INVALID_EVENT_RELATION")
      }

      if (isCheckViolation(error)) {
        throw new AppError("INVALID_EVENT_DATE_RANGE")
      }

      throw error
    }
  }

  async delete(data: DeleteEventData): Promise<boolean> {
    const result = await this.database.query(
      `DELETE FROM events
       WHERE id = $1 AND user_id = $2`,
      [data.id, data.userId],
    )

    return (result.rowCount ?? 0) > 0
  }
}

function toEventRecord(row: EventRow): EventRecord {
  return {
    id: row.id,
    userId: row.user_id,
    categoryId: row.category_id,
    priorityId: row.priority_id,
    name: row.name,
    description: row.description,
    eventDateStart: row.event_date_start,
    eventDateEnd: row.event_date_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
