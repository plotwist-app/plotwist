import { supabase } from '@/services/supabase'

export const removeLikeService = async (id: number) => {
  const { error, data } = await supabase
    .from('review_likes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
