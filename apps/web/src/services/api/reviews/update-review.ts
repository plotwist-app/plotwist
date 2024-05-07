import { supabase } from '@/services/supabase'
import { Review } from '@/types/supabase/reviews'

type UpdateReviewValues = Pick<Review, 'rating' | 'review' | 'id'>

export const updateReview = async (values: UpdateReviewValues) => {
  const { id, rating, review } = values

  const { error, data } = await supabase
    .from('reviews')
    .update({ rating, review })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
