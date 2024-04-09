import { supabase } from '@/services/supabase'
import { Language } from '@/types/languages'
import { MediaType } from '@/types/supabase/media-type'
import { Review } from '@/types/supabase/reviews'

interface GetReview {
  id: Review['tmdb_id']
  mediaType: MediaType
  language: Language
}

export const getReviewsService = async ({
  id,
  mediaType,
  language,
}: GetReview) => {
  const { error, data } = await supabase
    .from('reviews_with_replies')
    .select('*')
    .eq('tmdb_id', id)
    .eq('language', language)
    .order('created_at', { ascending: true })
    .eq('media_type', mediaType)
    .returns<Review[]>()

  if (error) throw new Error(error.message)

  return data
}
