export const postgresErrorCodes = {
  checkViolation: "23514",
  foreignKeyViolation: "23503",
  invalidTextRepresentation: "22P02",
  uniqueViolation: "23505",
} as const

export type PostgresErrorCode = (typeof postgresErrorCodes)[keyof typeof postgresErrorCodes]

export function isPostgresErrorCode(error: unknown, code: PostgresErrorCode): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code
}

export function isUniqueViolation(error: unknown): boolean {
  return isPostgresErrorCode(error, postgresErrorCodes.uniqueViolation)
}

export function isForeignKeyViolation(error: unknown): boolean {
  return isPostgresErrorCode(error, postgresErrorCodes.foreignKeyViolation)
}

export function isCheckViolation(error: unknown): boolean {
  return isPostgresErrorCode(error, postgresErrorCodes.checkViolation)
}

export function isInvalidUuid(error: unknown): boolean {
  return isPostgresErrorCode(error, postgresErrorCodes.invalidTextRepresentation)
}
