import { EditListServiceValues } from '@/services/api/lists/edit-list'
import { List, ListItem, ListItemStatus } from '@/types/supabase/lists'
import { UseMutationResult } from '@tanstack/react-query'
import { ReactNode } from 'react'

type HandleFn<T> = UseMutationResult<null, Error, T, unknown>

export type ListsContextType = {
  lists: List[]

  handleCreateNewList: HandleFn<CreateNewListParams>
  handleDeleteList: HandleFn<string>
  handleAddToList: HandleFn<AddToListParams>
  handleEditList: HandleFn<EditListServiceValues>
  handleAddCollectionToList: HandleFn<AddCollectionToListParams>
  handleRemoveCollectionFromList: HandleFn<RemoveCollectionFromListParams>
  handleRemoveFromList: HandleFn<string>
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
