import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { mediaTypeEnum, schema } from '@/infra/db/schema'

export const toggleFavoriteBodySchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(mediaTypeEnum.enumValues),
  position: z.number().int().min(0).default(0),
})

export const toggleFavoriteResponseSchema = {
  200: z.object({
    favorite: createSelectSchema(schema.userFavorites)
      .extend({ createdAt: z.string() })
      .nullable(),
    action: z.enum(['added', 'removed']),
  }),
}

export const getUserFavoritesQuerySchema = z.object({
  userId: z.string(),
})

export const getUserFavoritesResponseSchema = {
  200: z.object({
    favorites: z.array(
      createSelectSchema(schema.userFavorites).extend({
        createdAt: z.string(),
      })
    ),
  }),
}

export const checkFavoriteQuerySchema = z.object({
  tmdbId: z.string(),
  mediaType: z.enum(mediaTypeEnum.enumValues),
})

export const checkFavoriteResponseSchema = {
  200: z.object({
    isFavorite: z.boolean(),
  }),
}
