import { type EventResponse } from "@proyecto-daw/shared"

export type EventRecord = {
  id: string
  userId: string
  categoryId: string | null
  priorityId: number
  name: string
  description: string | null
  eventDateStart: Date
  eventDateEnd: Date
  createdAt: Date
  updatedAt: Date
}

export function toEventResponse(event: EventRecord): EventResponse {
  return {
    event: {
      id: event.id,
      userId: event.userId,
      categoryId: event.categoryId,
      priorityId: event.priorityId,
      name: event.name,
      description: event.description,
      eventDateStart: event.eventDateStart.toISOString(),
      eventDateEnd: event.eventDateEnd.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    },
  }
}
