import { MediaType } from './media-type'

export type Review = {
  created_at: string
  id: string

  rating: number
  review: string
  user_id: string
  media_type: MediaType
  tmdb_id: number
  tmdb_title: string
  tmdb_overview: string
  tmdb_poster_path?: string

  user_info: UserInfo

  review_replies: ReviewReply[] | null
}

type UserInfo = {
  email: string
  raw_user_meta_data: {
    username: string
  }
}

export type ReviewReply = {
  created_at: Date
  id: string
  reply: string
  user_id: string
}
