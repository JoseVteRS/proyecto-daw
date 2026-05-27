import { z } from "zod"

const eventInputObjectSchema = z.object({
  categoryId: z.string().uuid().optional(),
  priorityId: z.number().int().min(1).max(3).optional(),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  eventDateStart: z.string().datetime(),
  eventDateEnd: z.string().datetime(),
})

export const createEventInputSchema = eventInputObjectSchema.refine(
  (event) => new Date(event.eventDateEnd).getTime() > new Date(event.eventDateStart).getTime(),
  {
    message: "eventDateEnd must be after eventDateStart",
    path: ["eventDateEnd"],
  },
)

export const updateEventInputSchema = eventInputObjectSchema
  .partial()
  .refine((event) => Object.keys(event).length > 0, {
    message: "At least one field is required",
  })
  .refine(
    (event) => {
      if (!event.eventDateStart || !event.eventDateEnd) {
        return true
      }

      return new Date(event.eventDateEnd).getTime() > new Date(event.eventDateStart).getTime()
    },
    {
      message: "eventDateEnd must be after eventDateStart",
      path: ["eventDateEnd"],
    },
  )

export const eventResponseSchema = z.object({
  event: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    categoryId: z.string().uuid().nullable(),
    priorityId: z.number().int(),
    name: z.string(),
    description: z.string().nullable(),
    eventDateStart: z.string().datetime(),
    eventDateEnd: z.string().datetime(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
})

export const listEventsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export const eventListResponseSchema = z.object({
  events: z.array(eventResponseSchema.shape.event),
})

export type CreateEventInput = z.infer<typeof createEventInputSchema>
export type UpdateEventInput = z.infer<typeof updateEventInputSchema>
export type EventResponse = z.infer<typeof eventResponseSchema>
export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>
export type EventListResponse = z.infer<typeof eventListResponseSchema>
