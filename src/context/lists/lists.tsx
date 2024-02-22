'use client'

import { createContext, useContext } from 'react'
import { ListsContextProviderProps, ListsContextType } from './lists.types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuth } from '../auth'

import {
  changeListCoverPathService,
  changeListItemStatusService,
  removeFromListService,
  removeCollectionFromListService,
  addCollectionToListService,
  addToListService,
  createListService,
  deleteListService,
  fetchListsService,
} from '@/services/api/lists'
import { editListService } from '@/services/api/lists/edit-list'

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

  const handleEditList = useMutation({
    mutationFn: editListService,
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
        handleEditList,

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
