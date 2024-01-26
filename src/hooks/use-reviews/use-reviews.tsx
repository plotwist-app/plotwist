import { useMutation } from '@tanstack/react-query'

import { createReviewService } from '@/services/api/reviews/create-review'
import { deleteReviewService } from '@/services/api/reviews/delete-review'
import { likeReviewService } from '@/services/api/reviews/like-review'
import { removeLikeService } from '@/services/api/reviews/remove-like'

export const useReviews = () => {
  const handleCreateReview = useMutation({
    mutationFn: createReviewService,
  })

  const handleDeleteReview = useMutation({
    mutationFn: deleteReviewService,
  })

  const handleLikeReview = useMutation({
    mutationFn: likeReviewService,
  })

  const handleRemoveLike = useMutation({
    mutationFn: removeLikeService,
  })

  return {
    handleCreateReview,
    handleDeleteReview,
    handleLikeReview,
    handleRemoveLike,
  }
}
