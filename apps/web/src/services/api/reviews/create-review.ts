import { CreateReviewValues } from '@/hooks/use-reviews/use-reviews.types'
import { supabase } from '@/services/supabase'
import { sanitizeTmdbItem } from '@/utils/tmdb/review/sanitize-tmdb-item'

export const createReview = async ({
  userId,
  mediaType,
  rating,
  hasSpoilers,
  review,
  tmdbItem,
  language,
}: CreateReviewValues) => {
  const tmdbItemValues = sanitizeTmdbItem(tmdbItem)

  const { error, data } = await supabase.from('reviews').insert({
    has_spoilers: hasSpoilers,
    rating,
    review,
    media_type: mediaType,
    user_id: userId,
    language,

    ...tmdbItemValues,
  })

  if (error) throw new Error(error.message)
  return data
}
