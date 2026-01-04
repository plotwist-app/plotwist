import { schema } from '@/db/schema'
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createFollowBodySchema = z.object({
  userId: z.string(),
})

export const getFollowQuerySchema = z.object({
  userId: z.string(),
})

export const getFollowResponseSchema = {
  200: z.object({
    follow: createSelectSchema(schema.followers).nullable(),
  }),
}

export const deleteFollowBodySchema = z.object({
  userId: z.string(),
})

export const getFollowersQuerySchema = z.object({
  followedId: z.string().optional(),
  followerId: z.string().optional(),
  pageSize: z.string().default('10'),
  cursor: z.string().optional(),
})

export const getFollowersResponseSchema = {
  200: z.object({
    followers: z.array(
      createSelectSchema(schema.followers).merge(
        createSelectSchema(schema.users)
          .pick({
            username: true,
            avatarUrl: true,
          })
          .extend({
            subscriptionType: z.enum(['PRO', 'MEMBER']),
          })
      )
    ),
    nextCursor: z.string().nullable(),
  }),
}
