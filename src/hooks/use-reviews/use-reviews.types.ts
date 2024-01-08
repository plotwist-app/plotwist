import { MediaType } from '@/types/supabase/media-type'

export type CreateReviewValues = {
  review: string
  rating: number
  userId: string
  tmdbId: number
  mediaType: MediaType
}

export type LikeReviewValues = {
  reviewId: number
  userId: string
}
