import pg from "pg"

const { Pool } = pg
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida. Revisa el archivo .env en la raíz del proyecto.")
}

export const pool = new Pool({
  connectionString,
})
