import type { MovieDetails, TvSerieDetails } from '@/services/tmdb'
import type { MediaType } from './media-type'
import type { Profile } from './profile'

export type Recommendation = {
  id: string
  created_at: string
  receiver_user_id: string
  media_type: MediaType
  tmdb_id: number
  sender_user_id: string
  message: string
}

export type DetailedRecommendation = Recommendation & {
  receiver_profile: Profile
  sender_profile: Profile
  tmdb_item: MovieDetails | TvSerieDetails
}
