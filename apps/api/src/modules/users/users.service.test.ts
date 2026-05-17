import { describe, expect, it, vi } from "vitest"

import { AppError } from "../../http/app-error.js"
import { UsersService, type UsersRepository } from "./users.service.js"

const createdAt = new Date("2026-01-02T03:04:05.000Z")

function createRepository(overrides: Partial<UsersRepository> = {}): UsersRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "user-1",
      roleId: 1,
      name: "Ada",
      email: "ada@example.com",
      createdAt,
    }),
    findByEmail: vi.fn().mockResolvedValue({
      id: "user-1",
      roleId: 1,
      name: "Ada",
      email: "ada@example.com",
      passwordHash: "hash",
      createdAt,
    }),
    ...overrides,
  }
}

describe("UsersService", () => {
  it("registers users with a hashed password and maps the response", async () => {
    const repository = createRepository()
    const service = new UsersService(repository, {
      hash: vi.fn().mockResolvedValue("hashed-password"),
      verify: vi.fn(),
    })

    const response = await service.register({ name: "Ada", email: "ada@example.com", password: "secret123" })

    expect(repository.create).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      passwordHash: "hashed-password",
    })
    expect(response).toEqual({
      user: {
        id: "user-1",
        roleId: 1,
        name: "Ada",
        email: "ada@example.com",
        createdAt: "2026-01-02T03:04:05.000Z",
      },
    })
  })

  it("logs users in with access and refresh tokens", async () => {
    const repository = createRepository()
    const service = new UsersService(
      repository,
      { hash: vi.fn(), verify: vi.fn().mockResolvedValue(true) },
      {
        createAccessToken: vi.fn().mockResolvedValue("access-token"),
        createRefreshToken: vi.fn().mockReturnValue("refresh-token"),
      },
    )

    await expect(service.login({ email: "ada@example.com", password: "secret123" })).resolves.toMatchObject({
      token: "access-token",
      refresh_token: "refresh-token",
    })
  })

  it("throws INVALID_CREDENTIALS when the user does not exist", async () => {
    const service = new UsersService(createRepository({ findByEmail: vi.fn().mockResolvedValue(null) }), {
      hash: vi.fn(),
      verify: vi.fn(),
    })

    await expect(service.login({ email: "missing@example.com", password: "secret123" })).rejects.toEqual(
      new AppError("INVALID_CREDENTIALS"),
    )
  })
})
