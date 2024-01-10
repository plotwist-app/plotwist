import { supabase } from '@/services/supabase'
import { CreateReviewValues, LikeReviewValues } from './use-reviews.types'
import { sanitizeTmdbItem } from '@/utils/tmdb/review/sanitize-tmdb-item'

export const createReview = async ({
  userId,
  mediaType,
  rating,
  review,
  tmdbItem,
}: CreateReviewValues) => {
  const tmdbItemValues = sanitizeTmdbItem(tmdbItem)

  const { error, data } = await supabase.from('reviews').insert({
    rating,
    review,
    media_type: mediaType,
    user_id: userId,

    ...tmdbItemValues,
  })

  if (error) throw new Error(error.message)
  return data
}

export const deleteReview = async (id: number) => {
  const { error, data } = await supabase.from('reviews').delete().eq('id', id)

  if (error) throw new Error(error.message)
  return data
}

export const likeReview = async (values: LikeReviewValues) => {
  const { reviewId, userId } = values

  const { error, data } = await supabase.from('review_likes').insert({
    review_id: reviewId,
    user_id: userId,
  })

  if (error) throw new Error(error.message)
  return data
}

export const removeLike = async (id: number) => {
  const { error, data } = await supabase
    .from('review_likes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return data
}
