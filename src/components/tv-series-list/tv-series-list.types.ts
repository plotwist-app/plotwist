import { TvSeriesListType } from '@/services/tmdb/requests/tv-series/list'

export type TvSeriesListVariant = TvSeriesListType | 'discover'
export type TvSeriesListProps = {
  variant: TvSeriesListType
}
