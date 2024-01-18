import { Language } from '@/types/languages'
import { tmdbClient } from '..'
import { ListResponse, TvShow } from '../types'

export type TvShowsListsType =
  | 'airing_today'
  | 'on_the_air'
  | 'popular'
  | 'top_rated'

export type TvShowsListsResponse = ListResponse<TvShow>

export const tvShowsLists = async (
  list: TvShowsListsType,
  language: Language,
) => {
  const { data } = await tmdbClient.get<TvShowsListsResponse>(`/tv/${list}`, {
    params: {
      language,
    },
  })

  console.log({ data })

  return data
}
