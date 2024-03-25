import { TvSeriesListType } from '@plotwist/tmdb'

export type TvSeriesListVariant = TvSeriesListType | 'discover'
export type TvSeriesListProps = {
  variant: TvSeriesListVariant
}
