export type AppErrorCode = "EMAIL_ALREADY_REGISTERED" | "INVALID_CREDENTIALS"

export class AppError extends Error {
  constructor(readonly code: AppErrorCode) {
    super(code)
    this.name = "AppError"
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
