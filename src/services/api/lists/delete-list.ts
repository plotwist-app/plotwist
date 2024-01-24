import { supabase } from '@/services/supabase'

export const deleteListService = async (id: number) => {
  const { error, data } = await supabase.from('lists').delete().eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
