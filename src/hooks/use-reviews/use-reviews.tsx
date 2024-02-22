import { useMutation } from '@tanstack/react-query'

import { createReviewService } from '@/services/api/reviews/create-review'
import { deleteReviewService } from '@/services/api/reviews/delete-review'

export const useReviews = () => {
  const handleCreateReview = useMutation({
    mutationFn: createReviewService,
  })

  const handleDeleteReview = useMutation({
    mutationFn: deleteReviewService,
  })

  return {
    handleCreateReview,
    handleDeleteReview,
  }
}
