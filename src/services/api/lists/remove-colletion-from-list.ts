import { RemoveCollectionFromListParams } from '@/context/lists'
import { supabase } from '@/services/supabase'

export const removeCollectionFromList = async ({
  ids,
}: RemoveCollectionFromListParams) => {
  const { error, data } = await supabase
    .from('list_items')
    .delete()
    .in('id', ids)

  if (error) throw new Error(error.message)
  return data
}
