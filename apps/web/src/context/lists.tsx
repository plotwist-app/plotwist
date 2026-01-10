'use client'

import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import type { GetLists200ListsItem } from '@/api/endpoints.schemas'
import { useGetLists } from '@/api/list'
import { useSession } from './session'

export type ListsContextType = {
  lists: GetLists200ListsItem[]
  isLoading: boolean
}

export type ListsContextProviderProps = { children: ReactNode }

export const ListsContext = createContext<ListsContextType>(
  {} as ListsContextType
)

export const ListsContextProvider = ({
  children,
}: ListsContextProviderProps) => {
  const { user } = useSession()
  const { data, isLoading } = useGetLists({ userId: user?.id })

  return (
    <ListsContext.Provider
      value={{
        lists: data?.lists ?? [],
        isLoading,
      }}
    >
      {children}
    </ListsContext.Provider>
  )
}

export const useLists = () => {
  const context = useContext(ListsContext)

  if (!context) {
    throw new Error('ListsContext must be used within ListsContextProvider')
  }

  return context
}
