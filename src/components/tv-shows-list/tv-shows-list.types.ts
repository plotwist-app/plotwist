import { TvShowsListType } from '@/services/tmdb/requests/tv-series/list'

export type TvShowsListVariant = TvShowsListType | 'discover'
export type TvShowListProps = {
  variant: TvShowsListVariant
}
