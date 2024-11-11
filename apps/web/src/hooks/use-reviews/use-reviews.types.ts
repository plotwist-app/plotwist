import { Language } from '@/types/languages'
import { MediaType } from '@/types/supabase/media-type'
import { MovieDetails, TvSerieDetails } from '@/services/tmdb'

export type CreateReviewValues = {
  rating: number
  hasSpoilers: boolean
  review: string
  userId: string
  mediaType: MediaType

  tmdbItem: MovieDetails | TvSerieDetails
  language: Language
}
