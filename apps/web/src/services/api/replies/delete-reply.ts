import { DeleteReplyValues } from '@/hooks/use-replies/use-replies.types'
import { supabase } from '@/services/supabase'

export const deleteReplyService = async ({ replyId }: DeleteReplyValues) => {
  const { error, data } = await supabase
    .from('review_replies')
    .delete()
    .eq('id', replyId)

  if (error) throw new Error(error.message)

  return data
}
