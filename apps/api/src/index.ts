import express, { type ErrorRequestHandler } from "express"

import { categoriesRouter } from "./categories.js"
import { eventsRouter } from "./events.js"
import { logger, requestLogger } from "./logger.js"
import { sessionRouter } from "./session.js"
import { corsMiddleware, globalRateLimit, requireJsonContentType, securityHeaders } from "./security.js"
import { usersRouter } from "./users.js"

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.disable("x-powered-by")
app.use(securityHeaders)
app.use(corsMiddleware)
app.use(globalRateLimit)
app.use(requestLogger)
app.use(requireJsonContentType)
app.use(express.json({ limit: "100kb" }))

app.get("/health", (_request, response) => {
  response.json({ status: "ok" })
})

app.get("/", (_request, response) => {
  response.json({ name: "PROYECTO-DAW-V2 API" })
})

app.use("/api", sessionRouter)
app.use("/categories", categoriesRouter)
app.use("/events", eventsRouter)
app.use("/users", usersRouter)

const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (isCorsError(error)) {
    logger.warn({ error: formatError(error), origin: request.headers.origin }, "cors origin rejected")
    response.status(403).json({ error: "CORS_ORIGIN_NOT_ALLOWED" })
    return
  }

  if (isJsonSyntaxError(error)) {
    logger.warn({ error: formatError(error), path: request.originalUrl }, "invalid json payload")
    response.status(400).json({ error: "INVALID_JSON" })
    return
  }

  logger.error(
    {
      error: formatError(error),
      method: request.method,
      path: request.originalUrl,
    },
    "unhandled server error",
  )
  response.status(500).json({ error: "INTERNAL_SERVER_ERROR" })
}

function isCorsError(error: unknown): boolean {
  return error instanceof Error && error.message === "CORS_ORIGIN_NOT_ALLOWED"
}

function isJsonSyntaxError(error: unknown): boolean {
  return (
    error instanceof SyntaxError &&
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 400 &&
    "body" in error
  )
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    }
  }

  return { message: String(error) }
}

app.use(errorHandler)

app.listen(port, () => {
  logger.info({ port }, `API escuchando en http://localhost:${port}`)
})
