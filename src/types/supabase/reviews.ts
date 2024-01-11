import { MediaType } from './media-type'

export type Review = {
  created_at: string
  id: number

  rating: number
  review: string
  user_id: string
  media_type: MediaType
  tmdb_id: number
  tmdb_title: string
  tmdb_overview: string
  tmdb_poster_path?: string

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
