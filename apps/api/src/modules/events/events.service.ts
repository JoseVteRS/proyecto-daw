import { type EventListResponse, type ListEventsQuery, type EventResponse } from "@proyecto-daw/shared"

import { AppError } from "../../http/app-error.js"
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
  update(data: UpdateEventData): Promise<EventRecord | null>
  delete(data: DeleteEventData): Promise<boolean>
  list(data: {
    userId: string
    from: Date | null
    to: Date | null
  }): Promise<EventRecord[]>
}

export type UpdateEventData = {
  id: string
  userId: string
  categoryId?: string
  priorityId?: number
  name?: string
  description?: string
  eventDateStart?: string | Date
  eventDateEnd?: string | Date
}

export type DeleteEventData = {
  id: string
  userId: string
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

  async update(input: UpdateEventData): Promise<EventResponse> {
    const event = await this.eventsRepository.update({
      id: input.id,
      userId: input.userId,
      categoryId: input.categoryId,
      priorityId: input.priorityId,
      name: input.name,
      description: input.description,
      eventDateStart: input.eventDateStart ? new Date(input.eventDateStart) : undefined,
      eventDateEnd: input.eventDateEnd ? new Date(input.eventDateEnd) : undefined,
    })

    if (!event) {
      throw new AppError("EVENT_NOT_FOUND")
    }

    return toEventResponse(event)
  }

  async delete(input: DeleteEventData): Promise<void> {
    const deleted = await this.eventsRepository.delete(input)

    if (!deleted) {
      throw new AppError("EVENT_NOT_FOUND")
    }
  }
}
