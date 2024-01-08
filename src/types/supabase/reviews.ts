import { MediaType } from './media-type'

export type Review = {
  created_at: string
  id: number
  media_type: MediaType
  rating: number
  review: string
  tmdb_id: number
  user_id: string
}
