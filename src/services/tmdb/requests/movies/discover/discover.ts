import { tmdbClient } from '@/services/tmdb'
import { ListResponse, Movie } from '@/services/tmdb/types'
import { Language } from '@/types/languages'

export const discover = async (language: Language) => {
  const { data } = await tmdbClient.get<ListResponse<Movie>>(
    `/discover/movie`,
    {
      params: {
        language,
      },
    },
  )

  return data
}
