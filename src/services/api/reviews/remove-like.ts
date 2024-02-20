import { LikeReviewValues } from '@/hooks/use-reviews/use-reviews.types'
import { supabase } from '@/services/supabase'

export const removeLikeService = async (values: LikeReviewValues) => {
  const { reviewId, userId } = values

  const { error, data } = await supabase
    .from('likes')
    .delete()
    .eq('entity_type', 'REVIEW')
    .eq('review_id', reviewId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)

  return data
}
