import { z } from 'zod'

const i18nFieldSchema = z.record(z.string(), z.string())

const criteriaSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('ITEMS_WATCHED'),
    mediaType: z.enum(['MOVIE', 'TV_SHOW']).optional(),
  }),
  z.object({
    type: z.literal('ITEMS_IN_COLLECTION'),
    mediaType: z.enum(['MOVIE', 'TV_SHOW']).optional(),
  }),
  z.object({ type: z.literal('REVIEWS_WRITTEN') }),
  z.object({ type: z.literal('FOLLOWERS_COUNT') }),
  z.object({ type: z.literal('FOLLOWING_COUNT') }),
  z.object({ type: z.literal('LISTS_CREATED') }),
  z.object({ type: z.literal('FAVORITES_COUNT') }),
  z.object({ type: z.literal('EPISODES_WATCHED') }),
  z.object({
    type: z.literal('TMDB_SET'),
    tmdbIds: z.array(z.number()),
    mediaType: z.enum(['MOVIE', 'TV_SHOW']),
  }),
])

const achievementResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  icon: z.string(),
  target: z.number(),
  category: z.enum(['general', 'saga']),
  level: z.number(),
  criteria: criteriaSchema,
  name: i18nFieldSchema,
  description: i18nFieldSchema,
  sortOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
})

const userAchievementResponseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  icon: z.string(),
  target: z.number(),
  category: z.enum(['general', 'saga']),
  level: z.number(),
  name: i18nFieldSchema,
  description: i18nFieldSchema,
  sortOrder: z.number(),
  current: z.number(),
  isClaimed: z.boolean(),
  isEquipped: z.boolean(),
  claimedAt: z.string().or(z.date()).nullable(),
})

// Admin schemas
export const createAchievementBodySchema = z.object({
  slug: z.string().min(1).max(100),
  icon: z.string().min(1),
  target: z.number().int().positive(),
  category: z.enum(['general', 'saga']),
  level: z.number().int().positive(),
  criteria: criteriaSchema,
  name: i18nFieldSchema,
  description: i18nFieldSchema,
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const updateAchievementBodySchema = createAchievementBodySchema.partial()

export const achievementParamsSchema = z.object({
  id: z.string().uuid(),
})

export const toggleEquipBodySchema = z.object({
  isEquipped: z.boolean(),
})

// Response schemas
export const adminListAchievementsResponseSchema = {
  200: z
    .object({ achievements: z.array(achievementResponseSchema) })
    .describe('List of all achievements'),
}

export const adminGetAchievementResponseSchema = {
  200: z
    .object({ achievement: achievementResponseSchema })
    .describe('Achievement details'),
}

export const adminCreateAchievementResponseSchema = {
  201: z
    .object({ achievement: achievementResponseSchema })
    .describe('Achievement created'),
}

export const adminUpdateAchievementResponseSchema = {
  200: z
    .object({ achievement: achievementResponseSchema })
    .describe('Achievement updated'),
}

export const adminDeleteAchievementResponseSchema = {
  200: z
    .object({ achievement: achievementResponseSchema })
    .describe('Achievement deleted'),
}

export const getUserAchievementsResponseSchema = {
  200: z
    .object({ achievements: z.array(userAchievementResponseSchema) })
    .describe('User achievements with progress'),
}

export const claimAchievementResponseSchema = {
  200: z
    .object({
      userAchievement: z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        achievementId: z.string().uuid(),
        isClaimed: z.boolean(),
        isEquipped: z.boolean(),
        claimedAt: z.string().or(z.date()).nullable(),
        updatedAt: z.string().or(z.date()),
      }),
    })
    .describe('Achievement claimed'),
}

export const toggleEquipResponseSchema = {
  200: z
    .object({
      userAchievement: z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        achievementId: z.string().uuid(),
        isClaimed: z.boolean(),
        isEquipped: z.boolean(),
        claimedAt: z.string().or(z.date()).nullable(),
        updatedAt: z.string().or(z.date()),
      }),
    })
    .describe('Equip status toggled'),
}
