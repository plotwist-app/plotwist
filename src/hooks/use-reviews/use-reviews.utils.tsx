import { supabase } from '@/services/supabase'
import { CreateReviewValues, LikeReviewValues } from './use-reviews.types'

export const createReview = async ({
  userId,
  mediaType,
  tmdbId,
  ...values
}: CreateReviewValues) => {
  const { error, data } = await supabase.from('reviews').insert({
    ...values,
    tmdb_id: tmdbId,
    media_type: mediaType,
    user_id: userId,
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
