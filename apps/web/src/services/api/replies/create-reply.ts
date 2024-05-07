import { CreateReplyValues } from '@/hooks/use-replies'
import { supabase } from '@/services/supabase'

export const createReply = async ({
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
