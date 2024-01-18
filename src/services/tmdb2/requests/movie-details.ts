import { Language } from '@/types/languages'
import { tmdbClient } from '..'
import { MovieDetails } from '../types'

export const movieDetails = async (id: number, language: Language) => {
  const { data } = await tmdbClient.get<MovieDetails>(`/movie/${id}`, {
    params: {
      language,
    },
  })

  return data
}
