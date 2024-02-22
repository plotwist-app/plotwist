import { useMutation, useQueryClient } from '@tanstack/react-query'

import { likeService } from '@/services/api/likes/add-like'
import { removeLikeService } from '@/services/api/likes/remove-like'

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

export const useLike = () => {
  const queryClient = useQueryClient()

  const handleLike = useMutation({
    mutationFn: likeService,
    onMutate: async ({ reviewId, replyId, entityType, userId }) => {
      if (entityType === 'REVIEW') {
        await queryClient.cancelQueries({ queryKey: ['likes', reviewId] })

        const previousLikeReview = queryClient.getQueryData(['likes', reviewId])

        queryClient.setQueryData(
          ['likes', reviewId],
          (likeReview: LikeResponse) => {
            const newLikeReview = {
              ...likeReview,
              data: [{ user_id: userId }],
              count: likeReview.count + 1,
            }

            return newLikeReview
          },
        )

        return { previousLikeReview, reviewId }
      }

      await queryClient.cancelQueries({ queryKey: ['likes', replyId] })

      const previousLikeReview = queryClient.getQueryData(['likes', replyId])

      queryClient.setQueryData(
        ['likes', replyId],
        (likeReview: LikeResponse) => {
          const newLikeReview = {
            ...likeReview,
            data: [{ user_id: userId }],
            count: likeReview.count + 1,
          }

          return newLikeReview
        },
      )

      return { previousLikeReview, replyId }
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ['likes', context?.reviewId ?? context?.replyId],
        context?.previousLikeReview,
      )
    },
  })

  const handleRemoveLike = useMutation({
    mutationFn: removeLikeService,
    onMutate: async ({ reviewId, replyId, entityType }) => {
      if (entityType === 'REVIEW') {
        await queryClient.cancelQueries({ queryKey: ['likes', reviewId] })

        const previousLikeReview = queryClient.getQueryData(['likes', reviewId])

        queryClient.setQueryData(
          ['likes', reviewId],
          (likeReview: LikeResponse) => {
            const newLikeReview = {
              ...likeReview,
              data: [],
              count: likeReview.count - 1,
            }

            return newLikeReview
          },
        )

        return { previousLikeReview, reviewId }
      }

      await queryClient.cancelQueries({ queryKey: ['likes', replyId] })

      const previousLikeReview = queryClient.getQueryData(['likes', replyId])

      queryClient.setQueryData(
        ['likes', replyId],
        (likeReview: LikeResponse) => {
          const newLikeReview = {
            ...likeReview,
            data: [],
            count: likeReview.count - 1,
          }

          return newLikeReview
        },
      )

      return { previousLikeReview, replyId }
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ['likes', context?.reviewId],
        context?.previousLikeReview,
      )
    },
  })

  return {
    handleLike,
    handleRemoveLike,
  }
}
