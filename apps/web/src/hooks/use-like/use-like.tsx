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

interface OptimisticLikeProps {
  reviewId?: string
  replyId?: string
  entityType: 'REVIEW' | 'REPLY'
  userId: string
}

export const useLike = () => {
  const queryClient = useQueryClient()

  async function OptimisticAddLike({
    reviewId,
    replyId,
    entityType,
    userId,
  }: OptimisticLikeProps) {
    const id = entityType === 'REVIEW' ? reviewId : replyId

    await queryClient.cancelQueries({ queryKey: ['likes', id] })

    const previousLikeReview = queryClient.getQueryData(['likes', id])

    queryClient.setQueryData(['likes', id], (likeReview: LikeResponse) => {
      const newLikeReview = {
        ...likeReview,
        data: [{ user_id: userId }],
        count: likeReview.count + 1,
      }

      return newLikeReview
    })

    return { previousLikeReview, id }
  }

  const handleLike = useMutation({
    mutationFn: likeService,
    onMutate: async ({ reviewId, replyId, entityType, userId }) =>
      OptimisticAddLike({ reviewId, replyId, entityType, userId }),
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ['likes', context?.id],
        context?.previousLikeReview,
      )
    },
  })

  async function OptimisticRemoveLike({
    reviewId,
    replyId,
    entityType,
  }: Omit<OptimisticLikeProps, 'userId'>) {
    const id = entityType === 'REVIEW' ? reviewId : replyId

    await queryClient.cancelQueries({ queryKey: ['likes', id] })

    const previousLikeReview = queryClient.getQueryData(['likes', id])

    queryClient.setQueryData(['likes', id], (likeReview: LikeResponse) => {
      const newLikeReview = {
        ...likeReview,
        data: [],
        count: likeReview.count - 1,
      }

      return newLikeReview
    })

    return { previousLikeReview, id }
  }

  const handleRemoveLike = useMutation({
    mutationFn: removeLikeService,
    onMutate: async ({ reviewId, replyId, entityType }) =>
      OptimisticRemoveLike({ reviewId, replyId, entityType }),
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ['likes', context?.id],
        context?.previousLikeReview,
      )
    },
  })

  return {
    handleLike,
    handleRemoveLike,
  }
}
