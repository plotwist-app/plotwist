import { tmdbClient } from '@/services/tmdb'
import { ListResponse, Movie } from '@/services/tmdb/types'
import { Language } from '@/types/languages'

type DiscoverFilters = {
  with_genres: string | null
  'release_date.gte': string | null
  'release_date.lte': string | null
}

export const discover = async (
  language: Language,
  filters: DiscoverFilters,
) => {
  const { data } = await tmdbClient.get<ListResponse<Movie>>(
    `/discover/movie`,
    {
      params: {
        language,
        ...filters,
      },
    },
  )

  return data
}
