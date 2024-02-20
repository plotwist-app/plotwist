import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createReviewService } from '@/services/api/reviews/create-review'
import { deleteReviewService } from '@/services/api/reviews/delete-review'
import { likeReviewService } from '@/services/api/reviews/like-review'
import { removeLikeService } from '@/services/api/reviews/remove-like'

export interface LikeResponse {
  error: string
  data: Like[]
  count: number
  status: number
  statusText: string
}

export interface Like {
  id: string
  entity_type: string
  review_id: string | null
  review_reply_id: string | null
  user_id: string
}

export const useReviews = () => {
  const queryClient = useQueryClient()

  const handleCreateReview = useMutation({
    mutationFn: createReviewService,
  })

  const handleDeleteReview = useMutation({
    mutationFn: deleteReviewService,
  })

  const handleLikeReview = useMutation({
    mutationFn: likeReviewService,
    onMutate: async ({ reviewId }) => {
      await queryClient.cancelQueries({ queryKey: ['likes', reviewId] })

      const previousLikeReview = queryClient.getQueryData(['likes', reviewId])

      queryClient.setQueryData(
        ['likes', reviewId],
        (likeReview: LikeResponse) => {
          const newLikeReview = { ...likeReview, count: likeReview.count + 1 }

          return newLikeReview
        },
      )

      return { previousLikeReview }
    },
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
