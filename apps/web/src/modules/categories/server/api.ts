import {
  categoryListResponseSchema,
  categoryResponseSchema,
  type CategoryListResponse,
  type CategoryResponse,
  type CreateCategoryInput,
} from '@proyecto-daw/shared'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function listCategories(): Promise<CategoryListResponse> {
  const response = await fetch(`${apiBaseUrl}/categories`, {
    method: 'GET',
    credentials: 'include',
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(body, 'No se han podido recuperar las categorías.'), response.status)
  }

  return categoryListResponseSchema.parse(body)
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryResponse> {
  const response = await fetch(`${apiBaseUrl}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  })

  const body = await parseJson(response)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(body, 'No se ha podido crear la categoría.'), response.status)
  }

  return categoryResponseSchema.parse(body)
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
      return 'Inicia sesión para gestionar categorías.'
    case 'CATEGORY_ALREADY_EXISTS':
      return 'Ya existe una categoría con ese nombre.'
    case 'VALIDATION_ERROR':
      return 'Revisa los datos de la categoría.'
    default:
      return fallback
  }
}
