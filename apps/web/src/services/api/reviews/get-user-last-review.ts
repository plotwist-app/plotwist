import { supabase } from '@/services/supabase'

export const getUserLastReviewService = async (userId: string) => {
  const { error, data } = await supabase
    .from('reviews')
    .select(`*, likes(id)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw new Error(error.message)

  return data
}
