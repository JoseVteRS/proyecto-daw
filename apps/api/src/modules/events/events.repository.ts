import { type Pool } from "pg"

import { isCheckViolation, isForeignKeyViolation } from "../../db/postgres-errors.js"
import { pool } from "../../db.js"
import { AppError } from "../../http/app-error.js"
import { type CreateEventData, type EventsRepository } from "./events.service.js"
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
