'use client'

import { createContext, useContext } from 'react'
import { ListsContextProviderProps, ListsContextType } from './lists.types'
import { useMutation, useQuery } from '@tanstack/react-query'

import { fetchListsService } from '@/services/api/lists/fetch-lists'
import { createListService } from '@/services/api/lists/create-list'
import { editListService } from '@/services/api/lists/edit-list'
import { deleteListService } from '@/services/api/lists/delete-list'
import { addToListService } from '@/services/api/lists/add-to-list'
import { addCollectionToListService } from '@/services/api/lists/add-collection-to-list'
import { removeCollectionFromListService } from '@/services/api/lists/remove-collection-from-list'
import { removeFromListService } from '@/services/api/lists/remove-from-list'
import { changeListCoverPathService } from '@/services/api/lists/change-list-cover-path'

import { useSession } from '../session'

export const ListsContext = createContext<ListsContextType>(
  {} as ListsContextType,
)

export const ListsContextProvider = ({
  children,
}: ListsContextProviderProps) => {
  const { user } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ['lists', user?.id],
    queryFn: async () => await fetchListsService(user?.id),
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

  const handleChangeListCoverPath = useMutation({
    mutationFn: changeListCoverPathService,
  })

  return (
    <ListsContext.Provider
      value={{
        lists: data ?? [],
        isLoading,

        handleCreateNewList,
        handleDeleteList,
        handleAddToList,
        handleEditList,
        handleChangeListCoverPath,

        handleAddCollectionToList,
        handleRemoveCollectionFromList,
        handleRemoveFromList,
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
