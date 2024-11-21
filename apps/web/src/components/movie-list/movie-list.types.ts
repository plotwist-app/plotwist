import type { MovieListType } from '@/services/tmdb'

export type MovieListVariant = MovieListType | 'discover'
export type MovieListProps = {
  variant: MovieListVariant
}
