import { MediaType } from './media-type'

export type Review = {
  created_at: string
  id: number
  media_type: MediaType
  rating: number
  review: string
  tmdb_id: number
  user_id: string
  user_info: UserInfo
  review_likes?: ReviewLike[]
}

type UserInfo = {
  email: string
  raw_user_meta_data: {
    username: string
  }
}

type ReviewLike = {
  id: number
  user_id: string
  created_at: string
}
