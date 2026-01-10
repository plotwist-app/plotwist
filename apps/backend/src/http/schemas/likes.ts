import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { schema } from '@/db/schema'

export const createLikeBodySchema = createInsertSchema(schema.likes).pick({
  entityId: true,
  entityType: true,
})

export const createLikeResponseSchema = {
  201: z.object({
    like: createSelectSchema(schema.likes),
  }),
}

export const deleteLikeParamsSchema = z.object({
  id: z.string(),
})

export const getLikesParamsSchema = z.object({
  entityId: z.string(),
})

export const getLikesResponseSchema = {
  200: z.object({
    likes: z.array(
      createSelectSchema(schema.likes).extend({
        user: createSelectSchema(schema.users)
          .pick({
            id: true,
            username: true,
            avatarUrl: true,
          })
          .extend({
            subscriptionType: z.enum(['MEMBER', 'PRO']),
          }),
      })
    ),
  }),
}
