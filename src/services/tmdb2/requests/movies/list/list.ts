import { tmdbClient } from '@/services/tmdb2'
import { Language } from '@/types/languages'
import { MovieListResponse, MovieListType } from './list.types'

export const list = async (list: MovieListType, language: Language) => {
  const { data } = await tmdbClient.get<MovieListResponse>(`/movie/${list}`, {
    params: {
      language,
    },
  })

  return data
}
