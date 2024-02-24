import { z } from 'zod'

export const moviesListFiltersSchema = z.object({
  release_date: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }),
  genres: z.array(z.number()),
  with_original_language: z.string().optional(),
  sort_by: z.string().optional(),

  with_watch_providers: z.array(z.number()),
  watch_region: z.string().optional(),

  vote_average: z.object({
    gte: z.number().min(0).max(10),
    lte: z.number().min(0).max(10),
  }),

  vote_count: z.object({
    gte: z.number().min(0).max(500),
  }),
})

export type MoviesListFiltersFormValues = z.infer<
  typeof moviesListFiltersSchema
>
