import { z } from "zod"

export const createEventInputSchema = z
  .object({
    categoryId: z.string().uuid().optional(),
    priorityId: z.number().int().min(1).max(3).optional(),
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().max(2000).optional(),
    eventDateStart: z.string().datetime(),
    eventDateEnd: z.string().datetime(),
  })
  .refine((event) => new Date(event.eventDateEnd).getTime() > new Date(event.eventDateStart).getTime(), {
    message: "eventDateEnd must be after eventDateStart",
    path: ["eventDateEnd"],
  })

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

export type CreateEventInput = z.infer<typeof createEventInputSchema>
export type EventResponse = z.infer<typeof eventResponseSchema>
