import { List, ListItem, ListItemStatus } from '@/types/lists'
import { UseMutationResult } from '@tanstack/react-query'
import { ReactNode } from 'react'

type HandleFn<T> = UseMutationResult<null, Error, T, unknown>

export type ListsContextType = {
  lists: List[]

  handleCreateNewList: HandleFn<CreateNewListValues>
  handleDeleteList: HandleFn<number>
  handleAddToList: HandleFn<AddToListValues>
  handleRemoveToList: HandleFn<number>
  handleChangeListItemStatus: HandleFn<ChangeListItemStatusParams>

  userId: string // TODO: refactor
}

export type ListsContextProviderProps = { children: ReactNode; userId: string }

export type CreateNewListValues = {
  name: string
  description: string
  userId: string
}

export type AddToListValues = {
  item: Omit<ListItem, 'id' | 'created_at'>
}

export type ChangeListItemStatusParams = {
  listItemId: number
  newStatus: ListItemStatus
}
