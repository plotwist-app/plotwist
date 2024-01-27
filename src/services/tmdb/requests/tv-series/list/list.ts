import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { TvShowsListType, TvShowsListResponse } from '.'

export const list = async (list: TvShowsListType, language: Language) => {
  const { data } = await tmdbClient.get<TvShowsListResponse>(`/tv/${list}`, {
    params: {
      language,
    },
  })

  return data
}
