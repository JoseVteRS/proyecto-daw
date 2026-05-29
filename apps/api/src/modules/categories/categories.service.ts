import { type CategoryListResponse, type CategoryResponse } from "@proyecto-daw/shared"

import { AppError } from "../../http/app-error.js"
import { toCategoryListResponse, toCategoryResponse, type CategoryRecord } from "./categories.mapper.js"

export type CategoryAccess = {
  userId: string
  roleId: number
}

export type CreateCategoryData = {
  userId: string
  name: string
  description: string | null
  color: string | null
}

export type UpdateCategoryData = CategoryAccess & {
  id: string
  name?: string
  description?: string
  color?: string
}

export type DeleteCategoryData = CategoryAccess & {
  id: string
}

export type CategoriesRepository = {
  create(data: CreateCategoryData): Promise<CategoryRecord>
  update(data: UpdateCategoryData): Promise<CategoryRecord | null>
  delete(data: DeleteCategoryData): Promise<boolean>
  list(data: { userId: string }): Promise<CategoryRecord[]>
}

export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async list(input: { userId: string }): Promise<CategoryListResponse> {
    const categories = await this.categoriesRepository.list({ userId: input.userId })
    return toCategoryListResponse(categories)
  }

  async create(input: {
    userId: string
    name: string
    description?: string
    color?: string
  }): Promise<CategoryResponse> {
    const category = await this.categoriesRepository.create({
      userId: input.userId,
      name: input.name,
      description: input.description ?? null,
      color: input.color ?? null,
    })

    return toCategoryResponse(category)
  }

  async update(input: UpdateCategoryData): Promise<CategoryResponse> {
    const category = await this.categoriesRepository.update(input)

    if (!category) {
      throw new AppError("CATEGORY_NOT_FOUND")
    }

    return toCategoryResponse(category)
  }

  async delete(input: DeleteCategoryData): Promise<void> {
    const deleted = await this.categoriesRepository.delete(input)

    if (!deleted) {
      throw new AppError("CATEGORY_NOT_FOUND")
    }
  }
}
