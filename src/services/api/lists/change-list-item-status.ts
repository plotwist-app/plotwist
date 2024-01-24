import { ChangeListItemStatusParams } from '@/context/lists'
import { supabase } from '@/services/supabase'

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
