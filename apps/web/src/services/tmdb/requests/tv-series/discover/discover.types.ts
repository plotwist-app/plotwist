import { Language } from '@/types/languages'

export type DiscoverTvSeriesFilters = Partial<
  Record<
    | 'air_date.gte'
    | 'air_date.lte'
    | 'sort_by'
    | 'with_genres'
    | 'with_original_language'
    | 'with_keywords'
    | 'with_watch_providers'
    | 'watch_region'
    | 'vote_average.gte'
    | 'vote_average.lte'
    | 'vote_count.gte',
    string | null
  >
>

export type DiscoverTvSeriesOptions = {
  language: Language
  page: number
  filters?: DiscoverTvSeriesFilters
}
