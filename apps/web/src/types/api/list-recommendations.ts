import { Movie, TvSerie } from '@/services/tmdb'

export type ListRecommendations = {
  movies: Movie[]
  tv: TvSerie[]
}
