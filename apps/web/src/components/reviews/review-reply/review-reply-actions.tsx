'use client'

import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import type { GetReviewReplies200Item } from '@/api/endpoints.schemas'
import { useDeleteLikeId, usePostLike } from '@/api/like'
import { getGetReviewRepliesQueryKey } from '@/api/review-replies'
import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

type ReplyActionProps = {
  disabled?: boolean
  active?: boolean
} & ComponentProps<'div'>

const ReplyAction = ({ disabled, active, ...props }: ReplyActionProps) => {
  return (
    <span
      className={cn(
        'cursor-pointer text-xs text-muted-foreground underline-offset-1 hover:underline',
        disabled && 'pointer-events-none animate-pulse opacity-50',
        active && 'font-medium'
      )}
      {...props}
    >
      {props.children}
    </span>
  )
}

type ReviewReplyActionsProps = {
  reply: GetReviewReplies200Item
}

export const ReviewReplyActions = ({ reply }: ReviewReplyActionsProps) => {
  const { user } = useSession()
  const { dictionary } = useLanguage()
  const handleCreateLike = usePostLike()
  const handleDeleteLike = useDeleteLikeId()

  if (!user) return <></>

  function handleLike() {
    if (reply.userLike) {
      return handleDeleteLike.mutate(
        { id: reply.userLike.id },
        {
          onSuccess: () => {
            APP_QUERY_CLIENT.invalidateQueries({
              queryKey: getGetReviewRepliesQueryKey({
                reviewId: reply.reviewId,
              }),
            })
          },
        }
      )
    }

    handleCreateLike.mutate(
      {
        data: { entityId: reply.id, entityType: 'REPLY' },
      },
      {
        onSuccess: () => {
          APP_QUERY_CLIENT.invalidateQueries({
            queryKey: getGetReviewRepliesQueryKey({
              reviewId: reply.reviewId,
            }),
          })
        },
      }
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <ReplyAction
          active={Boolean(reply.userLike)}
          onClick={() => handleLike()}
        >
          {reply.userLike ? dictionary.liked : dictionary.like}
        </ReplyAction>
      </div>
    </div>
  )
}
