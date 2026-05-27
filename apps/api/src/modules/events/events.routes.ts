import { Router } from "express"
import { createEventInputSchema, listEventsQuerySchema, updateEventInputSchema } from "@proyecto-daw/shared"

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
      handleEventError(error, response, next)
    }
  })

  router.patch("/:id", requireSession, async (request, response, next) => {
    const parsedInput = updateEventInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
      response.status(400).json({
        error: "VALIDATION_ERROR",
        issues: parsedInput.error.issues,
      })
      return
    }

    try {
      const body = await eventsService.update({
        id: String(request.params.id),
        userId: request.session!.userId,
        ...parsedInput.data,
      })

      response.status(200).json(body)
    } catch (error) {
      handleEventError(error, response, next)
    }
  })

  router.delete("/:id", requireSession, async (request, response, next) => {
    try {
      await eventsService.delete({
        id: String(request.params.id),
        userId: request.session!.userId,
      })

      response.status(204).send()
    } catch (error) {
      handleEventError(error, response, next)
    }
  })

  return router
}

export const eventsRouter = createEventsRouter()

function handleEventError(error: unknown, response: { status: (code: number) => { json: (body: unknown) => void; send: () => void } }, next: (error: unknown) => void) {
  if (error instanceof AppError) {
    const statusCodeByError = {
      INVALID_EVENT_RELATION: 400,
      INVALID_EVENT_DATE_RANGE: 400,
      EVENT_NOT_FOUND: 404,
    } as const

    if (error.code in statusCodeByError) {
      response.status(statusCodeByError[error.code as keyof typeof statusCodeByError]).json({ error: error.code })
      return
    }
  }

  next(error)
}
