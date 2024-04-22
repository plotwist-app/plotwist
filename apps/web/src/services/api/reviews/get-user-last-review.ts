import { supabase } from '@/services/supabase'
import { MediaType } from '@/types/supabase/media-type'
import { Review } from '@/types/supabase/reviews'

type GetUserLastReviewServiceParams = { userId: string; mediaType?: MediaType }

export const getUserLastReviewService = async ({
  userId,
  mediaType,
}: GetUserLastReviewServiceParams) => {
  const { data } = await supabase
    .from('reviews_ordered_by_likes')
    .select()
    .eq('user_id', userId)
    .eq('media_type', mediaType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single<Review>()

  return data
}
