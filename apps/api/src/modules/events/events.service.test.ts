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
    list: vi.fn().mockResolvedValue([]),
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

  it("lists events with parsed date filters", async () => {
    const list = vi.fn().mockResolvedValue([
      {
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
      },
    ])
    const repository = createRepository({ list })
    const service = new EventsService(repository)

    const response = await service.list({
      userId: "user-1",
      from: "2026-02-01T00:00:00.000Z",
      to: "2026-02-02T00:00:00.000Z",
    })

    expect(list).toHaveBeenCalledWith({
      userId: "user-1",
      from: new Date("2026-02-01T00:00:00.000Z"),
      to: new Date("2026-02-02T00:00:00.000Z"),
    })
    expect(response).toEqual({
      events: [
        {
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
      ],
    })
  })

  it("lists events without filters", async () => {
    const list = vi.fn().mockResolvedValue([])
    const repository = createRepository({ list })
    const service = new EventsService(repository)

    await service.list({
      userId: "user-1",
    })

    expect(list).toHaveBeenCalledWith({
      userId: "user-1",
      from: null,
      to: null,
    })
  })
})
