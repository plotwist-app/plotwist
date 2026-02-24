import { z } from 'zod'

export const appleAuthBodySchema = z.object({
  identityToken: z.string().min(1, 'Identity token is required'),
  authorizationCode: z.string().min(1, 'Authorization code is required'),
  email: z.string().email().optional(), // Apple only provides email on first auth
  fullName: z
    .object({
      givenName: z.string().optional(),
      familyName: z.string().optional(),
    })
    .optional(),
})

export const googleAuthBodySchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
})

export const socialAuthResponseSchema = {
  200: z.object({
    token: z.string(),
    isNewUser: z.boolean(),
    needsUsername: z.boolean(),
  }),
  400: z
    .object({
      message: z.string(),
    })
    .describe('Invalid token or authentication failed'),
  500: z
    .object({
      message: z.string(),
    })
    .describe('Internal server error'),
}

export const socialAuthSetUsernameBodySchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
})

export const socialAuthSetUsernameResponseSchema = {
  200: z.object({
    token: z.string(),
  }),
  400: z
    .object({
      message: z.string(),
    })
    .describe('Invalid username'),
  409: z
    .object({
      message: z.string(),
    })
    .describe('Username already taken'),
}
