import { z } from "zod"

export const registerUserInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
})

export const registerUserResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    roleId: z.number().int(),
    createdAt: z.string().datetime(),
  }),
})

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>
export type RegisterUserResponse = z.infer<typeof registerUserResponseSchema>
