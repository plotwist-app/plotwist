import { AddCollectionToListParams } from '@/context/lists'
import { supabase } from '@/services/supabase'

export const addCollectionToList = async ({
  items,
}: AddCollectionToListParams) => {
  const { error, data } = await supabase.from('list_items').insert(items)

  if (error) throw new Error(error.message)
  return data
}
