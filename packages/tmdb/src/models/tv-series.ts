import {
  Genre,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
} from '../utils/common'
import { WithMediaType } from '../utils/with_media_type'

export type TvSerie = {
  poster_path: string
  popularity: number
  id: number
  backdrop_path?: string
  vote_average: number
  overview: string
  first_air_date: string
  origin_country: string[]
  genre_ids: number[]
  original_language: string
  vote_count: number
  name: string
  original_name: string
}

export type TvSerieWithMediaType = WithMediaType<TvSerie, 'tv'>

export type CreatedBy = {
  id: number
  credit_id: string
  name: string
  gender: number
  profile_path: string
}
export type NextEpisodeToAir = {
  id: number
  name: string
  overview: string
  vote_average: number
  vote_count: number
  air_date: string
  episode_number: number
  production_code: string
  runtime: number
  season_number: number
  show_id: number
  still_path: string
}

export type LastEpisodeToAir = {
  air_date: string
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  season_number: number
  still_path: string
  vote_average: number
  vote_count: number
}

export type Network = {
  name: string
  id: number
  logo_path: string
  origin_country: string
}

export type Season = {
  air_date: string
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path: string
  season_number: number
  vote_average: number
}

export type TvSerieDetails = {
  backdrop_path: string
  created_by: CreatedBy[]
  episode_run_time: number[]
  first_air_date: string
  genres: Genre[]
  homepage: string
  id: number
  in_production: boolean
  languages: string[]
  last_air_date: string
  last_episode_to_air: LastEpisodeToAir
  name: string
  next_episode_to_air?: NextEpisodeToAir
  networks: Network[]
  number_of_episodes: number
  number_of_seasons: number
  origin_country: string[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  seasons: Season[]
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string
  type: string
  vote_average: number
  vote_count: number
}
