import { ListResponse, TvShow } from '@/services/tmdb2/types'

export type TvShowsListType =
  | 'airing_today'
  | 'on_the_air'
  | 'popular'
  | 'top_rated'

export type TvShowsListResponse = ListResponse<TvShow>
