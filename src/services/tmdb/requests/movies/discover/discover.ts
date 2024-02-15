import { tmdbClient } from '@/services/tmdb'
import { ListResponse, Movie } from '@/services/tmdb/types'
import { Language } from '@/types/languages'

type DiscoverFilters = {
  with_genres: string | null
  'release_date.gte': string | null
  'release_date.lte': string | null
  with_original_language: string | null
  sort_by: string | null
}

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
