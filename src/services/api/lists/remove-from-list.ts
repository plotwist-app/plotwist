import { supabase } from '@/services/supabase'

export const removeFromListService = async (id: number) => {
  const { error, data } = await supabase
    .from('list_items')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
