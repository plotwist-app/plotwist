import { MediaType } from '@/types/supabase/media-type'
import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'

export type CreateReviewValues = {
  rating: number
  review: string
  userId: string
  mediaType: MediaType

  tmdbItem: MovieDetails | TvSerieDetails
}
