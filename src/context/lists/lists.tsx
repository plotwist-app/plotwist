'use client'

import { createContext, useContext } from 'react'
import { ListsContextProviderProps, ListsContextType } from './lists.types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth'

import { changeListCoverPathService } from '@/services/api/lists/change-list-cover-path'
import { changeListItemStatusService } from '@/services/api/lists/change-list-item-status'
import { removeFromListService } from '@/services/api/lists/remove-from-list'
import { removeCollectionFromListService } from '@/services/api/lists/remove-colletion-from-list'
import { addCollectionToListService } from '@/services/api/lists/add-collection-to-list'
import { addToListService } from '@/services/api/lists/add-to-list'
import { createListService } from '@/services/api/lists/create-list'
import { deleteListService } from '@/services/api/lists/delete-list'
import { fetchListsService } from '@/services/api/lists/fetch-lists'

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
    queryFn: async () => await fetchListsService(user.id),
  })

  const handleCreateNewList = useMutation({
    mutationFn: createListService,
  })

  const handleDeleteList = useMutation({
    mutationFn: deleteListService,
  })

  const handleAddToList = useMutation({
    mutationFn: addToListService,
  })

  const handleAddCollectionToList = useMutation({
    mutationFn: addCollectionToListService,
  })

  const handleRemoveCollectionFromList = useMutation({
    mutationFn: removeCollectionFromListService,
  })

  const handleRemoveFromList = useMutation({
    mutationFn: removeFromListService,
  })

  const handleChangeListItemStatus = useMutation({
    mutationFn: changeListItemStatusService,
  })

  const handleChangeListCoverPath = useMutation({
    mutationFn: changeListCoverPathService,
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
