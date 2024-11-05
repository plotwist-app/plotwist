import { GetLists200ListsItem } from '@/api/endpoints.schemas'
import { ListItem, ListItemStatus } from '@/types/supabase/lists'
import { UseMutationResult } from '@tanstack/react-query'
import { ReactNode } from 'react'

type HandleFn<T> = UseMutationResult<null, Error, T, unknown>

export type ListsContextType = {
  lists: GetLists200ListsItem[]
  isLoading: boolean

  handleAddToList: HandleFn<AddToListParams>
  handleAddCollectionToList: HandleFn<AddCollectionToListParams>
  handleRemoveCollectionFromList: HandleFn<RemoveCollectionFromListParams>
  handleRemoveFromList: HandleFn<string>
  handleChangeListCoverPath: HandleFn<ChangeListCoverPathParams>
}

export type ListsContextProviderProps = { children: ReactNode }

export type CreateNewListParams = {
  name: string
  description: string
  userId: string
}

export type AddToListParams = {
  item: Omit<ListItem, 'id' | 'created_at'>
}

export type AddCollectionToListParams = {
  items: Array<Omit<ListItem, 'id' | 'created_at'>>
}

export type RemoveCollectionFromListParams = {
  ids: string[]
}

export type ChangeListItemStatusParams = {
  listItemId: string
  newStatus: ListItemStatus
}

export type ChangeListCoverPathParams = {
  listId: string
  newCoverPath: string
}
