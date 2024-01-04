import { supabase } from '@/services/supabase'
import {
  AddToListValues,
  ChangeListItemStatusParams,
  CreateNewListValues,
} from './lists.types'
import { List } from '@/types/lists'

export const fetchLists = async (userId: string) =>
  await supabase
    .from('lists')
    .select('*, list_items(*)')
    .eq('user_id', userId)
    .returns<List[]>()

export const createList = async ({
  userId,
  ...values
}: CreateNewListValues) => {
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

export const addToList = async ({ item }: AddToListValues) => {
  const { error, data } = await supabase.from('list_items').insert({
    ...item,
  })

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
