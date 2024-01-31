import { Movie, TvShow } from '.'
import { Person } from './person'

export type MediaType = 'tv' | 'movie' | 'person'

export type WithMediaType<T, K extends MediaType> = T & {
  media_type: K
}

export type MovieWithMediaType = WithMediaType<Movie, 'movie'>
export type TvShowWithMediaType = WithMediaType<TvShow, 'tv'>
export type PersonWithMediaType = WithMediaType<Person, 'person'>
