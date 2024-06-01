import { MediaType } from './media-type'
import { Profile } from './profile'

export type Recommendation = {
  id: string
  created_at: string
  receiver_user_id: string
  media_type: MediaType
  tmdb_id: number
  sender_user_id: string
}

export type DetailedRecommendation = Recommendation & {
  receiver_profile: Profile
  sender_profile: Profile
}