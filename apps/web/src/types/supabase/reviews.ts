import { Language } from '../languages'
import { MediaType } from './media-type'
import { Profile } from './profile'

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
  language: Language

  user: User
  replies: Reply[] | null
}

type User = Pick<Profile, 'id' | 'username' | 'image_path'>

export type Reply = {
  id: string
  created_at: Date
  reply: string
  user: User
}
