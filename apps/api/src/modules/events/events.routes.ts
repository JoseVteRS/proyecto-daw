import { Router } from "express"
import { createEventInputSchema, listEventsQuerySchema } from "@proyecto-daw/shared"

import { requireSession } from "../../auth-middleware.js"
import { AppError } from "../../http/app-error.js"
import { PostgresEventsRepository } from "./events.repository.js"
import { EventsService } from "./events.service.js"

export function createEventsRouter(eventsService = new EventsService(new PostgresEventsRepository())) {
  const router = Router()

  router.get("/", requireSession, async (request, response, next) => {
    const parsedQuery = listEventsQuerySchema.safeParse(request.query)

    if (!parsedQuery.success) {
      response.status(400).json({
        error: "VALIDATION_ERROR",
        issues: parsedQuery.error.issues,
      })
      return
    }

    try {
      const body = await eventsService.list({
        userId: request.session!.userId,
        ...parsedQuery.data,
      })

      response.status(200).json(body)
    } catch (error) {
      next(error)
    }
  })

  router.post("/", requireSession, async (request, response, next) => {
    const parsedInput = createEventInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
      response.status(400).json({
        error: "VALIDATION_ERROR",
        issues: parsedInput.error.issues,
      })
      return
    }

    try {
      const body = await eventsService.create({
        userId: request.session!.userId,
        ...parsedInput.data,
      })

      response.status(201).json(body)
    } catch (error) {
      if (error instanceof AppError && error.code === "INVALID_EVENT_RELATION") {
        response.status(400).json({ error: error.code })
        return
      }

      if (error instanceof AppError && error.code === "INVALID_EVENT_DATE_RANGE") {
        response.status(400).json({ error: error.code })
        return
      }

      next(error)
    }
  })

  return router
}

export const eventsRouter = createEventsRouter()
