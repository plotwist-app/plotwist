import { z } from 'zod'

export const collectionFiltersSchema = z.object({
  status: z.enum(['WATCHED', 'WATCHING', 'WATCHLIST', 'DROPPED']),
  userId: z.string(),
  rating: z.number().optional(),
  mediaType: z.enum(['TV_SHOW', 'MOVIE']),
  orderBy: z.enum(['addedAt', 'updatedAt', 'rating']),
  orderDirection: z.enum(['asc', 'desc']),
})

export type CollectionFiltersFormValues = z.infer<
  typeof collectionFiltersSchema
>
