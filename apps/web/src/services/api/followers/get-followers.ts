import { supabase } from '@/services/supabase'
import { Follow } from '@/types/supabase/follow'

export const getFollowers = async (id: string) => {
  const { data, error } = await supabase
    .from('followers')
    .select()
    .eq('followed_id', id)
    .returns<Follow[]>()

  if (error) throw new Error(error.message)
  return data
}
