import { Router } from "express"
import { createEventInputSchema, type EventResponse } from "@proyecto-daw/shared"

import { requireSession } from "./auth-middleware.js"
import { pool } from "./db.js"

export const eventsRouter = Router()

eventsRouter.post("/", requireSession, async (request, response, next) => {
  const parsedInput = createEventInputSchema.safeParse(request.body)

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
      category_id: string | null
      priority_id: number
      name: string
      description: string | null
      event_date_start: Date
      event_date_end: Date
      created_at: Date
      updated_at: Date
    }>(
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
        request.session!.userId,
        parsedInput.data.categoryId ?? null,
        parsedInput.data.priorityId ?? 2,
        parsedInput.data.name,
        parsedInput.data.description ?? null,
        parsedInput.data.eventDateStart,
        parsedInput.data.eventDateEnd,
      ],
    )

    const event = result.rows[0]
    const body: EventResponse = {
      event: {
        id: event.id,
        userId: event.user_id,
        categoryId: event.category_id,
        priorityId: event.priority_id,
        name: event.name,
        description: event.description,
        eventDateStart: event.event_date_start.toISOString(),
        eventDateEnd: event.event_date_end.toISOString(),
        createdAt: event.created_at.toISOString(),
        updatedAt: event.updated_at.toISOString(),
      },
    }

    response.status(201).json(body)
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      response.status(400).json({ error: "INVALID_EVENT_RELATION" })
      return
    }

    if (isCheckViolation(error)) {
      response.status(400).json({ error: "INVALID_EVENT_DATE_RANGE" })
      return
    }

    next(error)
  }
})

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23503"
}

function isCheckViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23514"
}
