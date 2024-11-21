import type { TvSeriesListType } from '@/services/tmdb'

export type TvSeriesListVariant = TvSeriesListType | 'discover'
export type TvSeriesListProps = {
  variant: TvSeriesListVariant
}
