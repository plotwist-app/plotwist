import { supabase } from '@/services/supabase'

export const deleteFollow = async (followId: string) => {
  const { error, data } = await supabase
    .from('followers')
    .delete()
    .eq('id', followId)

  if (error) throw new Error(error.message)
  return data
}
