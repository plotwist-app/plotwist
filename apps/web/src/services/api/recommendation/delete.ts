import { supabase } from '@/services/supabase'

export const deleteMutation = async (id: string) => {
  const { data, error } = await supabase
    .from('recommendations')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
