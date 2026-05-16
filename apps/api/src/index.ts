import express from "express"

const app = express()
const port = Number(process.env.PORT ?? 4000)

app.use(express.json())

app.get("/health", (_request, response) => {
  response.json({ status: "ok" })
})

app.get("/", (_request, response) => {
  response.json({ name: "PROYECTO-DAW-V2 API" })
})

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`)
})
