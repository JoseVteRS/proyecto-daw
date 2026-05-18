import { type EventResponse } from "@proyecto-daw/shared"

import { toEventResponse, type EventRecord } from "./events.mapper.js"

export type CreateEventData = {
  userId: string
  categoryId: string | null
  priorityId: number
  name: string
  description: string | null
  eventDateStart: Date
  eventDateEnd: Date
}

export type EventsRepository = {
  create(data: CreateEventData): Promise<EventRecord>
}

export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async create(input: {
    userId: string
    categoryId?: string
    priorityId?: number
    name: string
    description?: string
    eventDateStart: string | Date
    eventDateEnd: string | Date
  }): Promise<EventResponse> {
    const event = await this.eventsRepository.create({
      userId: input.userId,
      categoryId: input.categoryId ?? null,
      priorityId: input.priorityId ?? 2,
      name: input.name,
      description: input.description ?? null,
      eventDateStart: new Date(input.eventDateStart),
      eventDateEnd: new Date(input.eventDateEnd),
    })

    return toEventResponse(event)
  }
}
