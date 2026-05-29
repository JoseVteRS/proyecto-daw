import { describe, expect, it, vi } from "vitest"

import { AppError } from "../../http/app-error.js"
import { CategoriesService, type CategoriesRepository } from "./categories.service.js"

const createdAt = new Date("2026-01-02T03:04:05.000Z")
const updatedAt = new Date("2026-01-03T03:04:05.000Z")

function createRepository(overrides: Partial<CategoriesRepository> = {}): CategoriesRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "category-1",
      userId: "user-1",
      name: "Work",
      description: null,
      color: "#ffffff",
      createdAt,
      updatedAt,
    }),
    update: vi.fn().mockResolvedValue({
      id: "category-1",
      userId: "user-1",
      name: "Personal",
      description: "Updated",
      color: "#000000",
      createdAt,
      updatedAt,
    }),
    delete: vi.fn().mockResolvedValue(true),
    list: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}

describe("CategoriesService", () => {
  it("creates categories and maps the response", async () => {
    const repository = createRepository()
    const service = new CategoriesService(repository)

    const response = await service.create({
      userId: "user-1",
      name: "Work",
      color: "#ffffff",
    })

    expect(repository.create).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Work",
      description: null,
      color: "#ffffff",
    })
    expect(response.category.createdAt).toBe("2026-01-02T03:04:05.000Z")
  })

  it("throws CATEGORY_NOT_FOUND when update finds no category", async () => {
    const service = new CategoriesService(createRepository({ update: vi.fn().mockResolvedValue(null) }))

    await expect(
      service.update({ id: "missing", userId: "user-1", roleId: 1, name: "Work" }),
    ).rejects.toEqual(new AppError("CATEGORY_NOT_FOUND"))
  })

  it("throws CATEGORY_NOT_FOUND when delete removes no category", async () => {
    const service = new CategoriesService(createRepository({ delete: vi.fn().mockResolvedValue(false) }))

    await expect(service.delete({ id: "missing", userId: "user-1", roleId: 1 })).rejects.toEqual(
      new AppError("CATEGORY_NOT_FOUND"),
    )
  })
})
