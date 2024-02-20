import { Language } from '@/types/languages'

export type DiscoverTvSeriesFilters = Record<
  | 'with_genres'
  | 'air_date.gte'
  | 'air_date.lte'
  | 'with_original_language'
  | 'sort_by'
  | 'with_watch_providers'
  | 'watch_region'
  | 'vote_average.gte'
  | 'vote_average.lte'
  | 'vote_count.gte',
  string | null
>

export type DiscoverTvSeriesOptions = {
  language: Language
  page: number
  filters?: DiscoverTvSeriesFilters
}
