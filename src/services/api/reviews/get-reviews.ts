import { supabase } from '@/services/supabase'
import { MediaType } from '@/types/supabase/media-type'
import { Review } from '@/types/supabase/reviews'

interface GetReview {
  id: Review['tmdb_id']
  mediaType: MediaType
}

export const getReviewsService = async ({ id, mediaType }: GetReview) => {
  const { error, data } = await supabase
    .from('reviews_with_replies')
    .select('*')
    .eq('tmdb_id', id)
    .order('id', { ascending: false })
    .eq('media_type', mediaType)
    .returns<Review[]>()

  if (error) throw new Error(error.message)

  return data
}
