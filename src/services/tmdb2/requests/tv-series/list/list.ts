import { tmdbClient } from '@/services/tmdb2'
import { ListResponse, TvShow } from '@/services/tmdb2/types'
import { Language } from '@/types/languages'

export type TvShowsListsType =
  | 'airing_today'
  | 'on_the_air'
  | 'popular'
  | 'top_rated'

export type TvShowsListsResponse = ListResponse<TvShow>

export const list = async (list: TvShowsListsType, language: Language) => {
  const { data } = await tmdbClient.get<TvShowsListsResponse>(`/tv/${list}`, {
    params: {
      language,
    },
  })

  return data
}
