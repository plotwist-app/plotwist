'use client'

import { ReactNode, createContext, useContext } from 'react'
import {
  CreateNewListValues,
  ListsContextProviderProps,
  ListsContextType,
} from './lists.types'
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { List } from '@/types/lists'

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
  const supabase = createClientComponentClient()

  const { data } = useQuery({
    queryKey: LISTS_QUERY_KEY,
    queryFn: async () =>
      await supabase
        .from('lists')
        .select()
        .eq('user_id', userId)
        .returns<List[]>(),
  })

  const createList = async ({ userId, ...values }: CreateNewListValues) => {
    const { error, data } = await supabase.from('lists').insert({
      user_id: userId,
      ...values,
    })

    if (error) throw new Error(error.message)

    return data
  }

  const handleCreateNewList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: createList,
  })

  const deleteList = async (id: number) => {
    const { error, data } = await supabase.from('lists').delete().eq('id', id)

    if (error) throw new Error(error.message)

    return data
  }

  const handleDeleteList = useMutation({
    mutationKey: LISTS_QUERY_KEY,
    mutationFn: deleteList,
  })

  return (
    <ListsContext.Provider
      value={{ lists: data?.data || [], handleCreateNewList, handleDeleteList }}
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
