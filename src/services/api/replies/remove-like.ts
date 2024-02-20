import { LikeReplyValues } from '@/hooks/use-replies/use-replies.types'
import { supabase } from '@/services/supabase'

export const removeLikeReplyService = async (values: LikeReplyValues) => {
  const { replyId, userId } = values

  const { error, data } = await supabase
    .from('likes')
    .delete()
    .eq('entity_type', 'REPLY')
    .eq('review_reply_id', replyId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  return data
}
