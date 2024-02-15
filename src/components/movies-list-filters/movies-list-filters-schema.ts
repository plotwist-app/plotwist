import { z } from 'zod'

export const moviesListFiltersSchema = z.object({
  release_date: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }),
  genres: z.array(z.number()),
  with_original_language: z.string().optional(),
  sort_by: z.string().optional(),
})

export type MoviesListFiltersFormValues = z.infer<
  typeof moviesListFiltersSchema
>
