import { GetListById200List } from '@/api/endpoints.schemas'
import { Profile } from './profile'

export type List = GetListById200List

export type ListItem = {
  backdrop_path: string
  created_at: string
  id: string
  list_id: string
  overview: string
  poster_path?: string
  title: string
  tmdb_id: number
  media_type: ListItemMediaType
}

export type ListLike = {
  created_at: string
  id: string
  list_id: string
  user_id: string
}

export type ListItemMediaType = 'TV_SHOW' | 'MOVIE'
export type ListItemStatus = 'PENDING' | 'WATCHING' | 'WATCHED'

export type PopularList = List & {
  profiles: Profile
}
