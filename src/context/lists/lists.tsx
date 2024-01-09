'use client'

import { createContext, useContext } from 'react'
import { ListsContextProviderProps, ListsContextType } from './lists.types'
import { useMutation, useQuery } from '@tanstack/react-query'
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
import { useAuth } from '../auth'

export const LISTS_QUERY_KEY = ['lists']
export const ListsContext = createContext<ListsContextType>(
  {} as ListsContextType,
)

export const ListsContextProvider = ({
  children,
}: ListsContextProviderProps) => {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: LISTS_QUERY_KEY,
    queryFn: async () => await fetchLists(user.id),
  })

  const handleCreateNewList = useMutation({
    mutationFn: createList,
  })

  const handleDeleteList = useMutation({
    mutationFn: deleteList,
  })

  const handleAddToList = useMutation({
    mutationFn: addToList,
  })

  const handleAddCollectionToList = useMutation({
    mutationFn: addCollectionToList,
  })

  const handleRemoveCollectionToList = useMutation({
    mutationFn: removeCollectionToList,
  })

  const handleRemoveToList = useMutation({
    mutationFn: removeToList,
  })

  const handleChangeListItemStatus = useMutation({
    mutationFn: changeListItemStatus,
  })

  const handleChangeListCoverPath = useMutation({
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
