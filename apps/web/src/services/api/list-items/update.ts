import { supabase } from '@/services/supabase'
import { ListItem } from '@/types/supabase/lists'

export const updateListItem = async (
  id: string,
  values: Partial<Record<keyof ListItem, unknown>>,
) => {
  const { error, data } = await supabase
    .from('list_items')
    .update(values)
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
