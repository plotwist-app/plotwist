import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { mediaTypeEnum, schema, statusEnum } from '@/db/schema'
import { languageQuerySchema, paginationQuerySchema } from './common'

export const upsertUserItemBodySchema = createInsertSchema(
  schema.userItems
).pick({ tmdbId: true, mediaType: true, status: true })

export const upsertUserItemResponseSchema = {
  201: z.object({
    userItem: createSelectSchema(schema.userItems).extend({
      addedAt: z.string(),
      updatedAt: z.string(),
      watchEntries: z
        .array(
          z.object({
            id: z.string(),
            watchedAt: z.string(),
          })
        )
        .optional(),
    }),
  }),
}

export const getUserItemsBodySchema = z
  .object({
    status: z.enum([...statusEnum.enumValues, 'ALL']),
    userId: z.string(),
    rating: z.array(z.string()).default(['0', '5']),
    mediaType: z.array(z.enum(mediaTypeEnum.enumValues)),
    orderBy: z.enum([
      'addedAt.desc',
      'addedAt.asc',
      'updatedAt.desc',
      'updatedAt.asc',
      'rating.desc',
      'rating.asc',
    ]),
    onlyItemsWithoutReview: z.boolean().default(false),
  })
  .merge(languageQuerySchema)
  .merge(paginationQuerySchema)

export const getUserItemsResponseSchema = {
  200: z.object({
    userItems: z.array(
      createSelectSchema(schema.userItems).extend({
        title: z.string(),
        posterPath: z.string().nullable(),
        backdropPath: z.string().nullable(),
      })
    ),
    nextCursor: z.string().nullable(),
  }),
}

export const deleteUserItemParamsSchema = z.object({
  id: z.string(),
})

export const getUserItemQuerySchema = createSelectSchema(schema.userItems)
  .pick({
    mediaType: true,
  })
  .extend({ tmdbId: z.string() })

export const getUserItemResponseSchema = {
  200: z.object({
    userItem: createSelectSchema(schema.userItems)
      .extend({
        watchEntries: z
          .array(
            z.object({
              id: z.string(),
              watchedAt: z.string(),
            })
          )
          .optional(),
      })
      .optional(),
  }),
}

export const getAllUserItemsQuerySchema = z.object({
  userId: z.string(),
  status: z.enum(['WATCHLIST', 'WATCHED', 'WATCHING', 'DROPPED', 'ALL']),
})

export const getAllUserItemsResponseSchema = {
  200: z.object({
    userItems: z.array(
      createSelectSchema(schema.userItems).pick({
        id: true,
        mediaType: true,
        tmdbId: true,
      })
    ),
  }),
}

export const getUserItemsCountQuerySchema = z.object({
  userId: z.string(),
})

export const getUserItemsCountResponseSchema = {
  200: z.object({
    count: z.number(),
  }),
}
