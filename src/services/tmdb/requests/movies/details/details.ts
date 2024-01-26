import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { MovieDetails } from '.'

export const details = async (id: number, language: Language) => {
  const { data } = await tmdbClient.get<MovieDetails>(`/movie/${id}`, {
    params: {
      language,
    },
  })

  return data
}
