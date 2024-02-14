import { z } from 'zod'

export const moviesListFiltersSchema = z.object({
  release_date: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }),
  genres: z.array(z.number()),
})

export type MoviesListFiltersFormValues = z.infer<
  typeof moviesListFiltersSchema
>
