import { MovieListType } from '@/services/tmdb/requests/movies/list'
import { Language } from '@/types/languages'

export type MovieListVariant = MovieListType | 'discover'
export type MovieListProps = {
  variant: MovieListVariant
  language: Language
}
