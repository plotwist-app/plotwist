import { MediaType } from '@/types/supabase/media-type'
import { MovieDetails, TvShowDetails } from 'tmdb-ts'

export type CreateReviewValues = {
  rating: number
  review: string
  userId: string
  mediaType: MediaType

  tmdbItem: TvShowDetails | MovieDetails
}

export type LikeReviewValues = {
  reviewId: number
  userId: string
}
