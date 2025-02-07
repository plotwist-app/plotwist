import { z } from 'zod'

export const collectionFiltersSchema = z.object({
  status: z.enum(['ALL', 'WATCHED', 'WATCHING', 'WATCHLIST', 'DROPPED']),
  userId: z.string(),
  rating: z.array(z.number()),
  mediaType: z.array(z.enum(['TV_SHOW', 'MOVIE'])),
  orderBy: z.enum([
    'addedAt.desc',
    'addedAt.asc',
    'updatedAt.desc',
    'updatedAt.asc',
    'rating.desc',
    'rating.asc',
  ]),
})

export type CollectionFiltersFormValues = z.infer<
  typeof collectionFiltersSchema
>
