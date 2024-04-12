import { supabase } from '@/services/supabase'
import { Language } from '@/types/languages'
import { ReviewsOrderedByLikes } from '../reviews/get-popular-reviews'

type GetProfileReviewsParams = { userId: string; language: Language }

export const getProfileReviews = async ({
  language,
  userId,
}: GetProfileReviewsParams) => {
  const { error, data } = await supabase
    .from('reviews_ordered_by_likes')
    .select()
    .eq('user_id', userId)
    .eq('language', language)
    .order('created_at', { ascending: false })
    .returns<ReviewsOrderedByLikes>()

  if (error) throw new Error(error.message)

  return data
}
