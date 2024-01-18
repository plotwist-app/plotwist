import { Movie, TvShow } from '.'
import { Person } from './person'

export type WithMediaType<T, K> = T & {
  media_type: K
}

export type MovieWithMediaType = WithMediaType<Movie, 'movie'>
export type TvShowWithMediaType = WithMediaType<TvShow, 'tv'>
export type PersonWithMediaType = WithMediaType<Person, 'person'>
