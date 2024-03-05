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
  changeListItemRating,
  editListService,
} from '@/services/api/lists'

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
    queryFn: async () => (user ? await fetchListsService(user.id) : null),
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

  const handleChangeListRating = useMutation({
    mutationFn: changeListItemRating,
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
        handleChangeListCoverPath,

        handleAddCollectionToList,
        handleRemoveCollectionFromList,
        handleRemoveFromList,

        handleChangeListItemStatus,
        handleChangeListRating,
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
