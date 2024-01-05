import { supabase } from '@/services/supabase'
import {
  AddCollectionToListParams,
  AddToListParams,
  ChangeListCoverPathParams,
  ChangeListItemStatusParams,
  CreateNewListParams,
  RemoveCollectionToListParams,
} from './lists.types'
import { List } from '@/types/lists'

export const fetchLists = async (userId: string) =>
  await supabase
    .from('lists')
    .select('*, list_items(*)')
    .eq('user_id', userId)
    .order('id', { ascending: true })
    .returns<List[]>()

export const createList = async ({
  userId,
  ...values
}: CreateNewListParams) => {
  const { error, data } = await supabase.from('lists').insert({
    user_id: userId,
    ...values,
  })

  if (error) throw new Error(error.message)
  return data
}

export const deleteList = async (id: number) => {
  const { error, data } = await supabase.from('lists').delete().eq('id', id)

  if (error) throw new Error(error.message)
  return data
}

export const addToList = async ({ item }: AddToListParams) => {
  const { error, data } = await supabase.from('list_items').insert(item)

  if (error) throw new Error(error.message)
  return data
}

export const addCollectionToList = async ({
  items,
}: AddCollectionToListParams) => {
  const { error, data } = await supabase.from('list_items').insert(items)

  if (error) throw new Error(error.message)
  return data
}

export const removeCollectionToList = async ({
  ids,
}: RemoveCollectionToListParams) => {
  const { error, data } = await supabase
    .from('list_items')
    .delete()
    .in('id', ids)

  if (error) throw new Error(error.message)
  return data
}

export const removeToList = async (id: number) => {
  const { error, data } = await supabase
    .from('list_items')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}

export const changeListItemStatus = async ({
  listItemId,
  newStatus,
}: ChangeListItemStatusParams) => {
  const { error, data } = await supabase
    .from('list_items')
    .update({ status: newStatus })
    .eq('id', listItemId)

  if (error) throw new Error(error.message)
  return data
}

export const changeListCoverPath = async ({
  listId,
  newCoverPath,
}: ChangeListCoverPathParams) => {
  const { error, data } = await supabase
    .from('lists')
    .update({ cover_path: newCoverPath })
    .eq('id', listId)

  if (error) throw new Error(error.message)
  return data
}
