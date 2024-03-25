import { WithMediaType } from '../utils/with_media_type'
import { MovieWithMediaType } from './movie'
import { TvSerieWithMediaType } from './tv-series'

export type KnownFor = MovieWithMediaType | TvSerieWithMediaType
export type Person = {
  id: number
  name: string
  known_for: KnownFor[]
  profile_path: string
  adult: boolean
  known_for_department: string
  gender: number
  popularity: number
}
export type PersonWithMediaType = WithMediaType<Person, 'person'>

export type PersonDetails = {
  adult: boolean
  also_known_as: string[]
  birthday: string
  biography: string
  deathday?: string
  gender: number
  homepage?: string
  id: number
  imdb_id: string
  known_for_department: string
  name: string
  place_of_birth: string
  popularity: number
  profile_path: string
}
