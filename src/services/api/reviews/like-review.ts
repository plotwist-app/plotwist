import { LikeReviewValues } from '@/hooks/use-reviews/use-reviews.types'
import { supabase } from '@/services/supabase'

export const likeReviewService = async (values: LikeReviewValues) => {
  const { reviewId, userId } = values

  const { error, data } = await supabase.from('likes').insert({
    review_id: reviewId,
    user_id: userId,
    entity_type: 'REVIEW',
  })

  if (error) throw new Error(error.message)
  return data
}
