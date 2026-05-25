import { z } from "zod"

export const registerUserInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
})

const authUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  roleId: z.number().int(),
  createdAt: z.string().datetime(),
})

export const registerUserResponseSchema = z.object({
  user: authUserSchema,
})

export const loginUserInputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(72),
})

export const loginUserResponseSchema = z.object({
  user: authUserSchema,
  token: z.string().min(1),
  refresh_token: z.string().min(1),
})

export const meResponseSchema = z.object({
  user: authUserSchema,
})

export const sessionResponseSchema = z
  .object({
    token: z.string().min(1),
    refresh_token: z.string().min(1),
  })
  .nullable()

export type RegisterUserInput = z.infer<typeof registerUserInputSchema>
export type RegisterUserResponse = z.infer<typeof registerUserResponseSchema>
export type LoginUserInput = z.infer<typeof loginUserInputSchema>
export type LoginUserResponse = z.infer<typeof loginUserResponseSchema>
export type MeResponse = z.infer<typeof meResponseSchema>
export type SessionResponse = z.infer<typeof sessionResponseSchema>
