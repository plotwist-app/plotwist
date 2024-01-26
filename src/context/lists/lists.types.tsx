import { List, ListItem, ListItemStatus } from '@/types/supabase/lists'
import { UseMutationResult } from '@tanstack/react-query'
import { ReactNode } from 'react'

type HandleFn<T> = UseMutationResult<null, Error, T, unknown>

export type ListsContextType = {
  lists: List[]

  handleCreateNewList: HandleFn<CreateNewListParams>
  handleDeleteList: HandleFn<number>
  handleAddToList: HandleFn<AddToListParams>
  handleAddCollectionToList: HandleFn<AddCollectionToListParams>
  handleRemoveCollectionFromList: HandleFn<RemoveCollectionFromListParams>
  handleRemoveFromList: HandleFn<number>
  handleChangeListItemStatus: HandleFn<ChangeListItemStatusParams>
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
  ids: number[]
}

export type ChangeListItemStatusParams = {
  listItemId: number
  newStatus: ListItemStatus
}

export type ChangeListCoverPathParams = {
  listId: number
  newCoverPath: string
}
