import {
  GetListById200List,
  GetListItemsByListId200ListItemsItem,
} from '@/api/endpoints.schemas'
import { Profile } from './profile'

export type List = GetListById200List
export type ListItem = GetListItemsByListId200ListItemsItem

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
