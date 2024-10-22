import { Language } from '@/types/languages'
import { MediaType } from '@/types/supabase/media-type'
import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'

export type CreateReviewValues = {
  rating: number
  contain_spoilers: boolean
  review: string
  userId: string
  mediaType: MediaType

  tmdbItem: MovieDetails | TvSerieDetails
  language: Language
}
