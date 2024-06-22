import { MovieListType } from '@plotwist/tmdb'

export type MovieListVariant = MovieListType | 'discover'
export type MovieListProps = {
  variant: MovieListVariant
}
