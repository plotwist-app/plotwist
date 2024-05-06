import { useMutation } from '@tanstack/react-query'

import { createReviewService } from '@/services/api/reviews/create-review'
import { deleteReviewService } from '@/services/api/reviews/delete-review'
import { APP_QUERY_CLIENT } from '@/context/app'

export const useReviews = () => {
  const invalidateQueries = async (reviewId: string) => {
    const queries = [
      ['user-last-review'],
      ['popular-reviews'],
      ['reviews'],
      ['likes', reviewId],
    ]

    await Promise.all(
      queries.map((queryKey) =>
        APP_QUERY_CLIENT.invalidateQueries({
          queryKey,
        }),
      ),
    )
  }

  const handleCreateReview = useMutation({
    mutationFn: createReviewService,
  })

  const handleDeleteReview = useMutation({
    mutationFn: deleteReviewService,
  })

  return {
    handleCreateReview,
    handleDeleteReview,
    invalidateQueries,
  }
}
