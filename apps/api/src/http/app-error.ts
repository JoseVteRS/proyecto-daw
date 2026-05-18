export type AppErrorCode =
  | "CATEGORY_ALREADY_EXISTS"
  | "CATEGORY_NOT_FOUND"
  | "EMAIL_ALREADY_REGISTERED"
  | "INVALID_CATEGORY_ID"
  | "INVALID_CREDENTIALS"
  | "INVALID_EVENT_DATE_RANGE"
  | "INVALID_EVENT_RELATION"

export class AppError extends Error {
  constructor(readonly code: AppErrorCode) {
    super(code)
    this.name = "AppError"
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
