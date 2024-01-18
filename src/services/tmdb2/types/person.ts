import { MovieWithMediaType, TvShowWithMediaType } from '.'

export type KnownFor = MovieWithMediaType | TvShowWithMediaType

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
