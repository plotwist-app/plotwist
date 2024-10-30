export type WatchListItemType = 'MOVIE' | 'TV_SHOW'

export interface WatchListItem {
  id: string
  tmdb_id: string
  type: WatchListItemType
  user_id: string
}

export interface AddItemToWatchListValues
  extends Pick<WatchListItem, 'user_id' | 'tmdb_id' | 'type'> {}

export interface RemoveItemFromWatchListValues
  extends Pick<WatchListItem, 'user_id' | 'tmdb_id'> {}

export interface GetWatchListValues extends Pick<WatchListItem, 'user_id'> {}
