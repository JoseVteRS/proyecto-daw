import { type EventListResponse, type ListEventsQuery, type EventResponse } from "@proyecto-daw/shared"

import { toEventListResponse, toEventResponse, type EventRecord } from "./events.mapper.js"

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
  list(data: {
    userId: string
    from: Date | null
    to: Date | null
  }): Promise<EventRecord[]>
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

  async list(input: {
    userId: string
    from?: ListEventsQuery["from"]
    to?: ListEventsQuery["to"]
  }): Promise<EventListResponse> {
    const events = await this.eventsRepository.list({
      userId: input.userId,
      from: input.from ? new Date(input.from) : null,
      to: input.to ? new Date(input.to) : null,
    })

    return toEventListResponse(events)
  }
}
