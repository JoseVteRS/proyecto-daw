import express, { type ErrorRequestHandler } from "express"

import { sessionRouter } from "./session.js"
import { usersRouter } from "./users.js"

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(express.json())

app.get("/health", (_request, response) => {
  response.json({ status: "ok" })
})

app.get("/", (_request, response) => {
  response.json({ name: "PROYECTO-DAW-V2 API" })
})

app.use("/api", sessionRouter)
app.use("/users", usersRouter)

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: "INTERNAL_SERVER_ERROR" })
}

app.use(errorHandler)

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`)
})
