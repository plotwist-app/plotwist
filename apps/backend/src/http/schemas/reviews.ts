import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { schema } from '@/db/schema'
import { languageQuerySchema } from './common'

export const createReviewBodySchema = createInsertSchema(schema.reviews).omit({
  userId: true,
  id: true,
  createdAt: true,
})

export const createReviewResponseSchema = {
  201: z
    .object({
      review: createInsertSchema(schema.reviews),
    })
    .describe('Review created.'),
  404: z
    .object({
      message: z.string(),
    })
    .describe('User not found'),
}

export const getReviewsQuerySchema = languageQuerySchema.extend({
  tmdbId: z.string().optional(),
  userId: z.string().optional(),
  limit: z.string().optional(),
  mediaType: z.enum(['MOVIE', 'TV_SHOW']).optional(),
  orderBy: z.enum(['likeCount', 'createdAt']).optional(),
  interval: z
    .enum(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'ALL_TIME'])
    .optional()
    .default('ALL_TIME'),
  seasonNumber: z.string().optional(),
  episodeNumber: z.string().optional(),
})

const review = createSelectSchema(schema.reviews).extend({
  user: createSelectSchema(schema.users).pick({
    id: true,
    username: true,
    avatarUrl: true,
  }),
  likeCount: z.number(),
  replyCount: z.number(),
  userLike: z
    .object({
      id: z.string(),
      entityId: z.string(),
      userId: z.string(),
      createdAt: z.string(),
    })
    .nullable(),
})

export const getReviewsResponseSchema = {
  200: z.array(review),
}

export const reviewParamsSchema = z.object({
  id: z.string(),
})

export const updateReviewBodySchema = createInsertSchema(schema.reviews).pick({
  rating: true,
  review: true,
  hasSpoilers: true,
})

export const updateReviewResponse = {
  200: createSelectSchema(schema.reviews),
}

export const getDetailedReviewsResponseSchema = {
  200: z.object({
    reviews: z.array(
      review.extend({
        title: z.string(),
        posterPath: z.string().nullable(),
        backdropPath: z.string().nullable(),
      })
    ),
  }),
}

export const getReviewQuerySchema = createSelectSchema(schema.reviews)
  .pick({
    mediaType: true,
  })
  .extend({
    tmdbId: z.string(),
    seasonNumber: z.string().optional(),
    episodeNumber: z.string().optional(),
  })

export const getReviewResponseSchema = {
  200: z.object({
    review: createSelectSchema(schema.reviews).nullable(),
  }),
}
