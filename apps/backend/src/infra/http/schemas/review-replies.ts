import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { schema } from '@/infra/db/schema'

export const createReviewReplyBodySchema = createInsertSchema(
  schema.reviewReplies
).pick({ reviewId: true, reply: true })

export const createReviewReplyResponseSchema = {
  201: z
    .object({
      reviewReply: createSelectSchema(schema.reviewReplies),
    })
    .describe('Review reply created.'),
  404: z
    .object({
      message: z.string(),
    })
    .describe('Review or user not found'),
}

export const reviewReplyParamsSchema = z.object({
  id: z.string(),
})

export const updateReviewReplyBodySchema = createInsertSchema(
  schema.reviewReplies
).pick({
  reply: true,
})

export const updateReviewReplyResponseSchema = {
  200: z.object({
    reviewReply: createSelectSchema(schema.reviewReplies),
  }),
}

export const updateReviewReplyParamsSchema = z.object({
  id: z.string(),
})

export const getReviewRepliesQuerySchema = z.object({
  reviewId: z.string(),
})

export const getReviewRepliesResponseSchema = {
  200: z.array(
    createSelectSchema(schema.reviewReplies).extend({
      user: createSelectSchema(schema.users).pick({
        id: true,
        username: true,
        avatarUrl: true,
      }),
      likeCount: z.number(),
      userLike: z
        .object({
          id: z.string(),
          entityId: z.string(),
          userId: z.string(),
          createdAt: z.string(),
        })
        .nullable(),
    })
  ),
}

export const deleteReviewReplyParamsSchema = z.object({
  id: z.string(),
})
