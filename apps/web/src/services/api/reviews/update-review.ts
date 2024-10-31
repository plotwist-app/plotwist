import { supabase } from '@/services/supabase'
import { Review } from '@/types/supabase/reviews'

type UpdateReviewValues = Pick<
  Review,
  'rating' | 'review' | 'id' | 'has_spoilers'
>

export const updateReview = async (values: UpdateReviewValues) => {
  const { id, has_spoilers: hasSpoilers, rating, review } = values

  const { error, data } = await supabase
    .from('reviews')
    .update({ has_spoilers: hasSpoilers, rating, review })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
