import { type CategoryListResponse, type CategoryResponse } from "@proyecto-daw/shared"

export type CategoryRecord = {
  id: string
  userId: string
  name: string
  description: string | null
  color: string | null
  createdAt: Date
  updatedAt: Date
}

export function toCategoryResponse(category: CategoryRecord): CategoryResponse {
  return {
    category: {
      id: category.id,
      userId: category.userId,
      name: category.name,
      description: category.description,
      color: category.color,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    },
  }
}

export function toCategoryListResponse(categories: CategoryRecord[]): CategoryListResponse {
  return {
    categories: categories.map((category) => ({
      id: category.id,
      userId: category.userId,
      name: category.name,
      description: category.description,
      color: category.color,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    })),
  }
}
