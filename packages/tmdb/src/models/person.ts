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
