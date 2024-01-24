import { Language } from '@/types/languages'
import { ListResponse, TvShow } from '../../types'
import { tmdbClient } from '../..'

export type TvShowsListsType =
  | 'airing_today'
  | 'on_the_air'
  | 'popular'
  | 'top_rated'

export type TvShowsListsResponse = ListResponse<TvShow>

export const lists = async (list: TvShowsListsType, language: Language) => {
  const { data } = await tmdbClient.get<TvShowsListsResponse>(`/tv/${list}`, {
    params: {
      language,
    },
  })

  return data
}
