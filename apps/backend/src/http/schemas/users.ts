import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { schema } from '@/db/schema'

export const createUserBodySchema = z.object({
  username: z.string().min(3, 'Username is required.'),
  email: z.string().email('Email is invalid.'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  displayName: z.string().optional(),
})

export const createUserResponseSchema = {
  409: z
    .object({
      message: z.string(),
    })
    .describe('Email or username is already registered.'),
  500: z
    .object({
      message: z.string(),
    })
    .describe('Fail to hash password.'),
  201: z
    .object({
      user: createInsertSchema(schema.users)
        .omit({ password: true })
        .extend({
          subscriptionType: z.enum(['MEMBER', 'PRO']),
        }),
    })
    .describe('User created.'),
}

export const checkAvailableUsernameQuerySchema = z.object({
  username: z.string().min(1, 'Username is required.'),
})

export const checkAvailableUsernameResponseSchema = {
  200: z.object({
    available: z.boolean(),
  }),
  409: z
    .object({
      message: z.string(),
    })
    .describe('Username is already registered.'),
}

export const isEmailAvailableQuerySchema = z.object({
  email: z.string().email('Email is invalid.'),
})

export const isEmailAvailableResponseSchema = {
  200: z.object({
    available: z.boolean(),
  }),
  409: z
    .object({
      message: z.string(),
    })
    .describe('Email is already registered.'),
}

export const getUserByUsernameParamsSchema = z.object({
  username: z.string(),
})

export const getUserByUsernameResponseSchema = {
  200: z.object({
    user: createSelectSchema(schema.users)
      .omit({ password: true })
      .extend({
        subscriptionType: z.enum(['MEMBER', 'PRO']),
      }),
  }),
}

export const getUserByIdParamsSchema = z.object({
  id: z.string().uuid(),
})

export const getUserByIdResponseSchema = {
  200: z.object({
    user: createSelectSchema(schema.users)
      .omit({ password: true })
      .extend({
        subscriptionType: z.enum(['MEMBER', 'PRO']),
      }),
  }),
}

export const getMeResponseSchema = {
  200: z.object({
    user: createSelectSchema(schema.users)
      .omit({ password: true })
      .extend({
        subscriptionType: z.enum(['MEMBER', 'PRO']),
      }),
  }),
}

export const updateUserResponseSchema = {
  200: z.object({
    user: createSelectSchema(schema.users).omit({ password: true }),
  }),
}

export const updateUserBodySchema = z.object({
  displayName: z.string().optional(),
  bannerUrl: z.string().optional(),
  avatarUrl: z.string().optional(),
  username: z.string().optional(),
  biography: z.string().optional(),
})

export const updateUserSchema = {
  200: z.object({
    user: createSelectSchema(schema.users).omit({ password: true }),
  }),
}

export const updateUserPasswordBodySchema = z.object({
  password: z.string(),
  token: z.string(),
})

export const updateUserPasswordResponseSchema = {
  200: z.object({
    status: z.enum(['password_set']),
  }),
}

export const updateUserPreferencesBodySchema = z.object({
  watchProvidersIds: z.array(z.number()).optional(),
  watchRegion: z.string().optional(),
  mediaTypes: z.array(z.string()).optional(),
  genreIds: z.array(z.number()).optional(),
})

export const updateUserPreferencesResponseSchema = {
  200: z.object({
    userPreferences: createSelectSchema(schema.userPreferences),
  }),
}

export const getUserPreferencesResponseSchema = {
  200: z.object({
    userPreferences: createSelectSchema(schema.userPreferences).nullable(),
  }),
}

export const searchUsersByUsernameQuerySchema = z.object({
  username: z.string(),
})

export const searchUsersByUsernameResponseSchema = {
  200: z.object({
    users: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        avatarUrl: z.string().nullable(),
        isFollowed: z.boolean(),
      })
    ),
  }),
}
