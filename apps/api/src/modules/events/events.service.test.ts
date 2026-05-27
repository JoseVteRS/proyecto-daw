import { describe, expect, it, vi } from "vitest"

import { AppError } from "../../http/app-error.js"
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
    update: vi.fn().mockResolvedValue(null),
    delete: vi.fn().mockResolvedValue(false),
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

  it("updates an event and maps the response", async () => {
    const update = vi.fn().mockResolvedValue({
      id: "event-1",
      userId: "user-1",
      categoryId: null,
      priorityId: 3,
      name: "Updated meeting",
      description: "Updated description",
      eventDateStart,
      eventDateEnd,
      createdAt,
      updatedAt,
    })
    const repository = createRepository({ update })
    const service = new EventsService(repository)

    const response = await service.update({
      id: "event-1",
      userId: "user-1",
      name: "Updated meeting",
      description: "Updated description",
      priorityId: 3,
      eventDateStart,
      eventDateEnd,
    })

    expect(update).toHaveBeenCalledWith({
      id: "event-1",
      userId: "user-1",
      name: "Updated meeting",
      description: "Updated description",
      priorityId: 3,
      categoryId: undefined,
      eventDateStart,
      eventDateEnd,
    })
    expect(response.event.name).toBe("Updated meeting")
  })

  it("throws EVENT_NOT_FOUND when update does not find the event", async () => {
    const update = vi.fn().mockResolvedValue(null)
    const repository = createRepository({ update })
    const service = new EventsService(repository)

    await expect(
      service.update({
        id: "missing-event",
        userId: "user-1",
        name: "Updated meeting",
      }),
    ).rejects.toMatchObject({ code: "EVENT_NOT_FOUND" } satisfies Partial<AppError>)
  })

  it("deletes an event", async () => {
    const remove = vi.fn().mockResolvedValue(true)
    const repository = createRepository({ delete: remove })
    const service = new EventsService(repository)

    await service.delete({
      id: "event-1",
      userId: "user-1",
    })

    expect(remove).toHaveBeenCalledWith({
      id: "event-1",
      userId: "user-1",
    })
  })
})
