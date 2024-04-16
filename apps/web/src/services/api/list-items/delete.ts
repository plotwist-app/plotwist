import { supabase } from '@/services/supabase'

export const deleteListItem = async (id: string) => {
  const { error, data } = await supabase
    .from('list_items')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
