import { useMutation } from '@tanstack/react-query'
import {
  createReview,
  deleteReview,
  likeReview,
  removeLike,
} from './use-reviews.utils'

export const useReviews = () => {
  const handleCreateReview = useMutation({
    mutationFn: createReview,
  })

  const handleDeleteReview = useMutation({
    mutationFn: deleteReview,
  })

  const handleLikeReview = useMutation({
    mutationFn: likeReview,
  })

  const handleRemoveLike = useMutation({
    mutationFn: removeLike,
  })

  return {
    handleCreateReview,
    handleDeleteReview,
    handleLikeReview,
    handleRemoveLike,
  }
}
