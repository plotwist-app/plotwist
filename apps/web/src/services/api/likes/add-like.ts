import { LikeValues } from '@/hooks/use-like/use-like.types'
import { supabase } from '@/services/supabase'

export const likeService = async (values: LikeValues) => {
  const { replyId, reviewId, userId, entityType } = values

  if (entityType === 'REVIEW') {
    const { error, data } = await supabase.from('likes').insert({
      review_id: reviewId,
      user_id: userId,
      entity_type: entityType,
    })

    if (error) throw new Error(error.message)

    return data
  }

  const { error, data } = await supabase.from('likes').insert({
    review_reply_id: replyId,
    user_id: userId,
    entity_type: entityType,
  })

  if (error) throw new Error(error.message)

  return data
}
