import { supabase } from '@/services/supabase'
import { Review } from '@/types/supabase/reviews'

interface ReviewOrderedByLikes extends Review {
  likes_count: number
}

const MAX_REVIEWS = 5

export const getPopularReviewsService = async () => {
  const { error, data } = await supabase
    .from('reviews_ordered_by_likes')
    .select()
    .limit(MAX_REVIEWS)
    .returns<ReviewOrderedByLikes[]>()

  if (error) throw new Error(error.message)

  return data
}
