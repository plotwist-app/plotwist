import { z } from 'zod'

export const createWatchEntryBodySchema = z.object({
  userItemId: z.string().uuid(),
  watchedAt: z.string().datetime().optional(),
})

export const createWatchEntryResponseSchema = {
  201: z.object({
    watchEntry: z.object({
      id: z.string().uuid(),
      userItemId: z.string().uuid(),
      watchedAt: z.string(),
      createdAt: z.string(),
    }),
  }),
}

export const getWatchEntriesQuerySchema = z.object({
  userItemId: z.string().uuid(),
})

export const getWatchEntriesResponseSchema = {
  200: z.object({
    watchEntries: z.array(
      z.object({
        id: z.string().uuid(),
        userItemId: z.string().uuid(),
        watchedAt: z.string(),
        createdAt: z.string(),
      })
    ),
  }),
}

export const updateWatchEntryParamsSchema = z.object({
  id: z.string().uuid(),
})

export const updateWatchEntryBodySchema = z.object({
  watchedAt: z.string().datetime(),
})

export const updateWatchEntryResponseSchema = {
  200: z.object({
    watchEntry: z.object({
      id: z.string().uuid(),
      userItemId: z.string().uuid(),
      watchedAt: z.string(),
      createdAt: z.string(),
    }),
  }),
}

export const deleteWatchEntryParamsSchema = z.object({
  id: z.string().uuid(),
})
