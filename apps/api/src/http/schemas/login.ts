import { z } from 'zod'

export const loginBodySchema = z.object({
  login: z.string().min(3, 'Login must be at least 3 characters long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
  url: z.string().optional(),
})

export const loginResponseSchema = {
  200: z.object({
    token: z.string().optional(),
    status: z.string().optional(),
  }),
  400: z
    .object({
      message: z.string(),
    })
    .describe('Invalid login or password.'),
}
