import { tmdbClient } from '@/services/tmdb'
import { ListResponse, Movie } from '@/services/tmdb/types'
import { Language } from '@/types/languages'

export type DiscoverMovieFilters = Partial<
  Record<
    | 'with_genres'
    | 'release_date.gte'
    | 'release_date.lte'
    | 'with_original_language'
    | 'sort_by'
    | 'with_watch_providers'
    | 'with_keywords'
    | 'watch_region'
    | 'vote_average.gte'
    | 'vote_average.lte'
    | 'vote_count.gte',
    string | null
  >
>

type DiscoverOptions = {
  language: Language
  page: number
  filters: DiscoverMovieFilters
}

export const discover = async (options: DiscoverOptions) => {
  const { page, language, filters } = options

  const { data } = await tmdbClient.get<ListResponse<Movie>>(
    `/discover/movie`,
    {
      params: {
        page,
        language,
        ...filters,
      },
    },
  )

  return data
}
