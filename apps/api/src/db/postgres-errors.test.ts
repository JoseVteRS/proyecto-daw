import { describe, expect, it } from "vitest"

import {
  isCheckViolation,
  isForeignKeyViolation,
  isInvalidUuid,
  isPostgresErrorCode,
  isUniqueViolation,
} from "./postgres-errors.js"

describe("postgres error helpers", () => {
  it("detects known PostgreSQL error codes", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true)
    expect(isForeignKeyViolation({ code: "23503" })).toBe(true)
    expect(isCheckViolation({ code: "23514" })).toBe(true)
    expect(isInvalidUuid({ code: "22P02" })).toBe(true)
  })

  it("returns false for non-matching and non-object errors", () => {
    expect(isPostgresErrorCode({ code: "99999" }, "23505")).toBe(false)
    expect(isPostgresErrorCode(new Error("boom"), "23505")).toBe(false)
    expect(isPostgresErrorCode(null, "23505")).toBe(false)
    expect(isPostgresErrorCode("23505", "23505")).toBe(false)
  })
})
