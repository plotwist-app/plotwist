'use client'

import { createContext, useContext } from 'react'
import { ListsContextProviderProps, ListsContextType } from './lists.types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth'

import { changeListCoverPath } from '@/services/api/lists/change-list-cover-path'
import { changeListItemStatus } from '@/services/api/lists/change-list-item-status'
import { removeFromList } from '@/services/api/lists/remove-from-list'
import { removeCollectionFromList } from '@/services/api/lists/remove-colletion-from-list'
import { addCollectionToList } from '@/services/api/lists/add-collection-to-list'
import { addToList } from '@/services/api/lists/add-to-list'
import { createList } from '@/services/api/lists/create-list'
import { deleteList } from '@/services/api/lists/delete-list'
import { fetchLists } from '@/services/api/lists/fetch-lists'

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

  const handleRemoveCollectionFromList = useMutation({
    mutationFn: removeCollectionFromList,
  })

  const handleRemoveFromList = useMutation({
    mutationFn: removeFromList,
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
        handleRemoveCollectionFromList,
        handleRemoveFromList,
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
