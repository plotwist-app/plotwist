import { tmdbClient } from '@/services/tmdb'
import { ListResponse, Movie } from '@/services/tmdb/types'
import { Language } from '@/types/languages'

type DiscoverFilters = Record<
  | 'with_genres'
  | 'release_date.gte'
  | 'release_date.lte'
  | 'with_original_language'
  | 'sort_by'
  | 'with_watch_providers'
  | 'watch_region',
  string | null
>

type DiscoverOptions = {
  language: Language
  page: number
  filters: DiscoverFilters
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
