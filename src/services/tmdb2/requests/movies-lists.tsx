import { Language } from '@/types/languages'
import { tmdbClient } from '..'
import { ListResponse, Movie } from '../types'

export type MoviesListType =
  | 'popular'
  | 'now_playing'
  | 'top_rated'
  | 'upcoming'

export type MoviesListResponse = ListResponse<Movie>

export const moviesList = async (list: MoviesListType, language: Language) => {
  const { data } = await tmdbClient.get<MoviesListResponse>(`/movie/${list}`, {
    params: {
      language,
    },
  })

  return data
}
