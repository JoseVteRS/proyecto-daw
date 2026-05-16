import { z } from "zod"

export const createCategoryInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
})

export const updateCategoryInputSchema = createCategoryInputSchema.partial().refine(
  (category) => Object.keys(category).length > 0,
  { message: "At least one field is required" },
)

export const categoryResponseSchema = z.object({
  category: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    color: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
})

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>
export type CategoryResponse = z.infer<typeof categoryResponseSchema>
