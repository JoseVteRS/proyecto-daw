import {
  eventResponseSchema,
  type CreateEventInput,
  type EventResponse,
} from '@proyecto-daw/shared'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function createEvent(input: CreateEventInput): Promise<EventResponse> {
  const response = await fetch(`${apiBaseUrl}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(body, 'No se ha podido crear el evento.'), response.status)
  }

  return eventResponseSchema.parse(body)
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
    case 'SESSION_REQUIRED':
      return 'Inicia sesión para crear eventos.'
    case 'INVALID_EVENT_DATE_RANGE':
      return 'La fecha de fin debe ser posterior a la de inicio.'
    case 'INVALID_EVENT_RELATION':
      return 'La categoría seleccionada no es válida.'
    case 'VALIDATION_ERROR':
      return 'Revisa los datos del evento.'
    default:
      return fallback
  }
}
