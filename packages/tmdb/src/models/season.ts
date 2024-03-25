import { Crew } from './credits'

export type GuestStar = {
  credit_id: string
  order: number
  character: string
  adult: boolean
  gender: number | null
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string | null
}

export type Episode = {
  air_date: string
  episode_number: number
  crew: Crew[]
  guest_stars: GuestStar[]
  id: number
  name: string
  overview: string
  production_code: string
  season_number: number
  still_path: string
  vote_average: number
  vote_count: number
  runtime: number
  show_id: number
}

export type SeasonDetails = {
  air_date: string
  episodes: Episode[]
  name: string
  overview: string
  id: number
  poster_path: string | null
  season_number: number
}
