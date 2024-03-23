import {
  Genre,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
} from '../utils/common'
import { WithMediaType } from '../utils/with_media_type'

export type BelongsToCollection = {
  id: number
  name: string
  poster_path: string
  backdrop_path: string
}

export type MovieDetails = {
  adult: boolean
  backdrop_path: string
  belongs_to_collection?: BelongsToCollection
  budget: number
  genres: Genre[]
  homepage: string
  id: number
  imdb_id: string
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path?: string
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  release_date: string
  revenue: number
  runtime: number
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export type Movie = {
  id: number
  poster_path: string
  adult: boolean
  overview: string
  release_date: string
  genre_ids: number[]
  original_title: string
  original_language: string
  title: string
  backdrop_path?: string
  popularity: number
  vote_count: number
  video: boolean
  vote_average: number
}

export type MovieWithMediaType = WithMediaType<Movie, 'movie'>
