import {
  loginUserResponseSchema,
  registerUserResponseSchema,
  type LoginUserInput,
  type LoginUserResponse,
  type RegisterUserInput,
  type RegisterUserResponse,
} from '@proyecto-daw/shared'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResponse> {
  const response = await fetch(`${apiBaseUrl}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(body, 'No se ha podido crear la cuenta.'), response.status)
  }

  return registerUserResponseSchema.parse(body)
}

export async function loginUser(input: LoginUserInput): Promise<LoginUserResponse> {
  const response = await fetch(`${apiBaseUrl}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(body, 'No se ha podido iniciar sesión.'), response.status)
  }

  return loginUserResponseSchema.parse(body)
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return fallback
  }

  switch (body.error) {
    case 'EMAIL_ALREADY_REGISTERED':
      return 'Ya existe una cuenta registrada con este correo.'
    case 'INVALID_CREDENTIALS':
      return 'El correo o la contraseña no son correctos.'
    case 'VALIDATION_ERROR':
      return 'Revisa los datos introducidos.'
    default:
      return fallback
  }
}
