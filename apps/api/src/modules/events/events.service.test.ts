import { describe, expect, it, vi } from "vitest"

import { EventsService, type EventsRepository } from "./events.service.js"

const createdAt = new Date("2026-01-02T03:04:05.000Z")
const updatedAt = new Date("2026-01-03T03:04:05.000Z")
const eventDateStart = new Date("2026-02-01T10:00:00.000Z")
const eventDateEnd = new Date("2026-02-01T11:00:00.000Z")

function createRepository(overrides: Partial<EventsRepository> = {}): EventsRepository {
  return {
    create: vi.fn().mockResolvedValue({
      id: "event-1",
      userId: "user-1",
      categoryId: null,
      priorityId: 2,
      name: "Meeting",
      description: null,
      eventDateStart,
      eventDateEnd,
      createdAt,
      updatedAt,
    }),
    ...overrides,
  }
}

describe("EventsService", () => {
  it("creates events with defaults and maps the response", async () => {
    const repository = createRepository()
    const service = new EventsService(repository)

    const response = await service.create({
      userId: "user-1",
      name: "Meeting",
      eventDateStart,
      eventDateEnd,
    })

    expect(repository.create).toHaveBeenCalledWith({
      userId: "user-1",
      categoryId: null,
      priorityId: 2,
      name: "Meeting",
      description: null,
      eventDateStart,
      eventDateEnd,
    })
    expect(response).toEqual({
      event: {
        id: "event-1",
        userId: "user-1",
        categoryId: null,
        priorityId: 2,
        name: "Meeting",
        description: null,
        eventDateStart: "2026-02-01T10:00:00.000Z",
        eventDateEnd: "2026-02-01T11:00:00.000Z",
        createdAt: "2026-01-02T03:04:05.000Z",
        updatedAt: "2026-01-03T03:04:05.000Z",
      },
    })
  })
})
