import { Router } from "express"
import { createCategoryInputSchema, updateCategoryInputSchema } from "@proyecto-daw/shared"

import { requireSession } from "../../auth-middleware.js"
import { AppError } from "../../http/app-error.js"
import { PostgresCategoriesRepository } from "./categories.repository.js"
import { CategoriesService } from "./categories.service.js"

export function createCategoriesRouter(
  categoriesService = new CategoriesService(new PostgresCategoriesRepository()),
) {
  const router = Router()

  router.post("/", requireSession, async (request, response, next) => {
    const parsedInput = createCategoryInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
      response.status(400).json({
        error: "VALIDATION_ERROR",
        issues: parsedInput.error.issues,
      })
      return
    }

    try {
      const body = await categoriesService.create({
        userId: request.session!.userId,
        ...parsedInput.data,
      })

      response.status(201).json(body)
    } catch (error) {
      handleCategoryError(error, response, next)
    }
  })

  router.patch("/:id", requireSession, async (request, response, next) => {
    const parsedInput = updateCategoryInputSchema.safeParse(request.body)

    if (!parsedInput.success) {
      response.status(400).json({
        error: "VALIDATION_ERROR",
        issues: parsedInput.error.issues,
      })
      return
    }

    try {
      const body = await categoriesService.update({
        id: String(request.params.id),
        userId: request.session!.userId,
        roleId: request.session!.roleId,
        ...parsedInput.data,
      })

      response.status(200).json(body)
    } catch (error) {
      handleCategoryError(error, response, next)
    }
  })

  router.delete("/:id", requireSession, async (request, response, next) => {
    try {
      await categoriesService.delete({
        id: String(request.params.id),
        userId: request.session!.userId,
        roleId: request.session!.roleId,
      })

      response.status(204).send()
    } catch (error) {
      handleCategoryError(error, response, next)
    }
  })

  return router
}

function handleCategoryError(error: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }, next: (error: unknown) => void) {
  if (error instanceof AppError) {
    const statusCodeByError = {
      CATEGORY_ALREADY_EXISTS: 409,
      CATEGORY_NOT_FOUND: 404,
      INVALID_CATEGORY_ID: 400,
    } as const

    if (error.code in statusCodeByError) {
      response.status(statusCodeByError[error.code as keyof typeof statusCodeByError]).json({ error: error.code })
      return
    }
  }

  next(error)
}

export const categoriesRouter = createCategoriesRouter()
