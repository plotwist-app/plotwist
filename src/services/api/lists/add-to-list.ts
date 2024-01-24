import { AddToListParams } from '@/context/lists'
import { supabase } from '@/services/supabase'

export const addToList = async ({ item }: AddToListParams) => {
  const { error, data } = await supabase.from('list_items').insert(item)

  if (error) throw new Error(error.message)
  return data
}
