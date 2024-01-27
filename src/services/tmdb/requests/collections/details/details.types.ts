import { Movie } from '@/services/tmdb/types'

export interface Collection {
  id: number
  backdrop_path: string
  name: string
  poster_path: string
  adult: boolean
  original_language: string
  original_name: string
  overview: string
}

export interface DetailedCollection extends Collection {
  parts: Movie[]
}
