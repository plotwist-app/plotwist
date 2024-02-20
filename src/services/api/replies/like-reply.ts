import { LikeReplyValues } from '@/hooks/use-replies/use-replies.types'
import { supabase } from '@/services/supabase'

export const likeReplyService = async (values: LikeReplyValues) => {
  const { replyId, userId } = values

  const { error, data } = await supabase.from('likes').insert({
    review_reply_id: replyId,
    user_id: userId,
    entity_type: 'REPLY',
  })

  if (error) throw new Error(error.message)
  return data
}
