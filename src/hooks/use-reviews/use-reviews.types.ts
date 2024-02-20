import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { MediaType } from '@/types/supabase/media-type'

export type CreateReviewValues = {
  rating: number
  review: string
  userId: string
  mediaType: MediaType

  tmdbItem: MovieDetails | TvSeriesDetails
}

export type LikeReviewValues = {
  reviewId: string
  userId: string
}
