export interface WatchListItem {
  id: string
  userId: string
  tmdbId: string
}

export interface AddItemToWatchListValues
  extends Pick<WatchListItem, 'userId' | 'tmdbId'> {}

export interface RemoveItemFromWatchListValues
  extends Pick<WatchListItem, 'userId' | 'tmdbId'> {}

export interface GetWatchListValues extends Pick<WatchListItem, 'userId'> {}
