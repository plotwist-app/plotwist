import type { GetLists200ListsItem } from '@/api/endpoints.schemas'
import type { ReactNode } from 'react'

export type ListsContextType = {
  lists: GetLists200ListsItem[]
  isLoading: boolean
}

export type ListsContextProviderProps = { children: ReactNode }
