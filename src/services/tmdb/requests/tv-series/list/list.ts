import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { TvShowsListType, TvShowsListResponse } from '.'

type ListQueryParams = {
  list: TvShowsListType
  language: Language
  page: number
}

export const list = async (params: ListQueryParams) => {
  const { list, language, page } = params

  const { data } = await tmdbClient.get<TvShowsListResponse>(`/tv/${list}`, {
    params: {
      language,
      page,
    },
  })

  return data
}
