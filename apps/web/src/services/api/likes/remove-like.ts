import { LikeValues } from '@/hooks/use-like/use-like.types'
import { supabase } from '@/services/supabase'

export const removeLikeService = async (values: LikeValues) => {
  const { replyId, reviewId, userId, entityType } = values

  if (entityType === 'REVIEW') {
    const { error, data } = await supabase
      .from('likes')
      .delete()
      .eq('entity_type', entityType)
      .eq('review_id', reviewId)
      .eq('user_id', userId)

    if (error) throw new Error(error.message)

    return data
  }

  const { error, data } = await supabase
    .from('likes')
    .delete()
    .eq('entity_type', entityType)
    .eq('review_reply_id', replyId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  return data
}
