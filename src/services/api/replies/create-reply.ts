import { CreateReplyValues } from '@/hooks/use-replies/use-replies.types'
import { supabase } from '@/services/supabase'

export const createReplyService = async ({
  reply,
  reviewId,
  userId,
}: CreateReplyValues) => {
  const { error, data } = await supabase.from('review_replies').insert({
    reply,
    review_id: reviewId,
    user_id: userId,
  })

  if (error) throw new Error(error.message)
  return data
}
