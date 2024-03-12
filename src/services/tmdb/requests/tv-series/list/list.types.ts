import { ListResponse, TvSerie } from '@/services/tmdb/types'

export type TvSeriesListType =
  | 'airing_today'
  | 'on_the_air'
  | 'popular'
  | 'top_rated'

export type TvSeriesListResponse = ListResponse<TvSerie>
