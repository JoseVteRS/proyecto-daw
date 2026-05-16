import cors, { type CorsOptions } from "cors"
import { type RequestHandler } from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"

const defaultAllowedOrigins = ["http://localhost:3000"]

export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: "same-site" },
})

export const corsMiddleware = cors(buildCorsOptions())

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "RATE_LIMIT_EXCEEDED" },
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "AUTH_RATE_LIMIT_EXCEEDED" },
})

export const requireJsonContentType: RequestHandler = (request, response, next) => {
  if (["POST", "PUT", "PATCH"].includes(request.method) && !request.is("application/json")) {
    response.status(415).json({ error: "UNSUPPORTED_MEDIA_TYPE" })
    return
  }

  next()
}

function buildCorsOptions(): CorsOptions {
  const allowedOrigins = (process.env.CORS_ORIGIN?.split(",") ?? defaultAllowedOrigins)
    .map((origin) => origin.trim())
    .filter(Boolean)

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error("CORS_ORIGIN_NOT_ALLOWED"))
    },
  }
}
