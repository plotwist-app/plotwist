import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { TvSeriesListType, TvSeriesListResponse } from '.'

type ListQueryParams = {
  list: TvSeriesListType
  language: Language
  page: number
}

export const list = async (params: ListQueryParams) => {
  const { list, language, page } = params

  const { data } = await tmdbClient.get<TvSeriesListResponse>(`/tv/${list}`, {
    params: {
      language,
      page,
    },
  })

  return data
}
