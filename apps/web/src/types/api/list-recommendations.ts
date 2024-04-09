import { Movie, TvSerie } from '@plotwist/tmdb'

export type ListRecommendations = {
  movies: Movie[]
  tv: TvSerie[]
}
