import { z } from 'zod'

export const sendRecommendationBodySchema = z.object({
  toUserId: z.string().uuid(),
  tmdbId: z.number().int(),
  mediaType: z.enum(['TV_SHOW', 'MOVIE']),
  message: z.string().nullable().optional(),
})

export const getRecommendationsQuerySchema = z.object({
  language: z.string().default('en-US'),
})

export const respondRecommendationBodySchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
})

export const respondRecommendationParamsSchema = z.object({
  id: z.string().uuid(),
})
