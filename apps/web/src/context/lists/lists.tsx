'use client'

import { createContext, useContext } from 'react'
import { ListsContextProviderProps, ListsContextType } from './lists.types'

import { useSession } from '../session'
import { useGetLists } from '@/api/list'

export const ListsContext = createContext<ListsContextType>(
  {} as ListsContextType,
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
