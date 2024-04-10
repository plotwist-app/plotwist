import { supabase } from '@/services/supabase'
import { Language } from '@/types/languages'
import { ReviewsOrderedByLikes } from '../reviews/get-popular-reviews'

export const getProfileReviews = async (userId: string, language: Language) => {
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
