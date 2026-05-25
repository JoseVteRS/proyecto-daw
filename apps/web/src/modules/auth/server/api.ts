import {
  loginUserResponseSchema,
  meResponseSchema,
  registerUserResponseSchema,
  type LoginUserInput,
  type LoginUserResponse,
  type MeResponse,
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

export async function getMe(): Promise<MeResponse | null> {
  const response = await fetch(`${apiBaseUrl}/api/me`, {
    method: 'GET',
    credentials: 'include',
  })

  if (response.status === 401) {
    return null
  }

  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(body, 'No se ha podido recuperar la sesión.'), response.status)
  }

  return meResponseSchema.parse(body)
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/api/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: '{}',
  })

  if (response.ok) {
    return
  }

  const body = await parseJson(response)
  throw new ApiError(getErrorMessage(body, 'No se ha podido cerrar sesión.'), response.status)
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
