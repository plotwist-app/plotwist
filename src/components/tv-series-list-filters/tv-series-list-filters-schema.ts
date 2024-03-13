import { z } from 'zod'

export const tvSeriesListFiltersSchema = z.object({
  genres: z.array(z.number()),
  air_date: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }),
  sort_by: z.string().optional(),
  vote_average: z.object({
    gte: z.number().min(0).max(10),
    lte: z.number().min(0).max(10),
  }),
  vote_count: z.object({
    gte: z.number().min(0).max(500),
  }),
  watch_region: z.string().optional(),
  with_watch_providers: z.array(z.number()),
  with_original_language: z.string().optional(),
})

export type TvSeriesListFiltersFormValues = z.infer<
  typeof tvSeriesListFiltersSchema
>
