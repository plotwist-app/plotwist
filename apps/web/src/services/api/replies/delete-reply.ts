import { supabase } from '@/services/supabase'

export const deleteReply = async (id: string) => {
  const { error, data } = await supabase
    .from('review_replies')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  return data
}
