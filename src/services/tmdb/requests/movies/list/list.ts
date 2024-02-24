import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { MovieListResponse, MovieListType } from './list.types'

type ListOptions = {
  list: MovieListType
  language: Language
  page: number
}

export const list = async (options: ListOptions) => {
  const { list, page = 1, language } = options

  const { data } = await tmdbClient.get<MovieListResponse>(`/movie/${list}`, {
    params: {
      language,
      page,
    },
  })

  return data
}
