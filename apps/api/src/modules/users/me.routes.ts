import { Router } from "express"

import { requireSession } from "../../auth-middleware.js"
import { PostgresUsersRepository } from "./users.repository.js"
import { toRegisterUserResponse } from "./users.mapper.js"

export function createMeRouter(usersRepository = new PostgresUsersRepository()) {
  const router = Router()

  router.get("/me", requireSession, async (request, response, next) => {
    try {
      const user = await usersRepository.findById(request.session!.userId)

      if (!user) {
        response.status(401).json({ error: "SESSION_REQUIRED" })
        return
      }

      response.status(200).json(toRegisterUserResponse(user))
    } catch (error) {
      next(error)
    }
  })

  return router
}

export const meRouter = createMeRouter()
