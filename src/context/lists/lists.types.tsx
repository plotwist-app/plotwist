import { List } from '@/types/lists'
import { UseMutationResult } from '@tanstack/react-query'
import { ReactNode } from 'react'

export type ListsContextType = {
  lists: List[]
  handleCreateNewList: UseMutationResult<
    null,
    Error,
    CreateNewListValues,
    unknown
  >
  handleDeleteList: UseMutationResult<null, Error, number, unknown>
}

export type ListsContextProviderProps = { children: ReactNode; userId: string }

export type CreateNewListValues = {
  name: string
  description: string
  userId: string
}
