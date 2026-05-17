import pino from "pino"
import { type RequestHandler } from "express"

const isProduction = process.env.NODE_ENV === "production"

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
})

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = performance.now()

  response.on("finish", () => {
    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100
    const level = response.statusCode >= 500 ? "error" : response.statusCode >= 400 ? "warn" : "info"

    logger[level](
      {
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs,
        ip: request.ip,
      },
      "request completed",
    )
  })

  next()
}

