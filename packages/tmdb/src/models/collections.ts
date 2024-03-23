import { Movie } from "./movie"

export type Collection = {
  id: number
  backdrop_path: string
  name: string
  poster_path: string
  adult: boolean
  original_language: string
  original_name: string
  overview: string
}

export type DetailedCollection = Collection & {
  parts: Movie[]
}
