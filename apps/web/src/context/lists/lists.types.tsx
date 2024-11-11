import { GetLists200ListsItem } from '@/api/endpoints.schemas'
import { ReactNode } from 'react'

export type ListsContextType = {
  lists: GetLists200ListsItem[]
  isLoading: boolean
}

export type ListsContextProviderProps = { children: ReactNode }
