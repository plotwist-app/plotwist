export interface AddItemToWatchListValues {
  userId: string

  tmdbId: string
}

export interface GetWatchListValues
  extends Omit<AddItemToWatchListValues, 'tmdbId'> {}
