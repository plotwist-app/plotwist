import { MovieWithMediaType, TvSerieWithMediaType } from '.'

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
