'use client'

import { ReactNode, createContext, useContext } from 'react'
import { ListsContextProviderProps, ListsContextType } from './lists.types'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import {
  addCollectionToList,
  addToList,
  changeListCoverPath,
  changeListItemStatus,
  createList,
  deleteList,
  fetchLists,
  removeCollectionToList,
  removeToList,
} from './lists.utils'

export const LISTS_QUERY_KEY = ['lists']
export const LISTS_QUERY_CLIENT = new QueryClient()
export const ListsContext = createContext<ListsContextType>(
  {} as ListsContextType,
)

export const ListsContextProviderWrapper = ({
  children,
}: {
  children: ReactNode
}) => (
  <QueryClientProvider client={LISTS_QUERY_CLIENT}>
    {children}
  </QueryClientProvider>
)

export const ListsContextProvider = ({
  children,
  userId,
}: ListsContextProviderProps) => {
  const { data } = useQuery({
    queryKey: LISTS_QUERY_KEY,
    queryFn: async () => await fetchLists(userId),
  })

  const handleCreateNewList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: createList,
  })

  const handleDeleteList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: deleteList,
  })

  const handleAddToList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: addToList,
  })

  const handleAddCollectionToList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: addCollectionToList,
  })

  const handleRemoveCollectionToList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: removeCollectionToList,
  })

  const handleRemoveToList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: removeToList,
  })

  const handleChangeListItemStatus = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: changeListItemStatus,
  })

  const handleChangeListCoverPath = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: changeListCoverPath,
  })

  return (
    <ListsContext.Provider
      value={{
        lists: data?.data || [],

        handleCreateNewList,
        handleDeleteList,
        handleAddToList,
        handleAddCollectionToList,
        handleRemoveCollectionToList,
        handleRemoveToList,
        handleChangeListItemStatus,
        handleChangeListCoverPath,

        userId,
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
