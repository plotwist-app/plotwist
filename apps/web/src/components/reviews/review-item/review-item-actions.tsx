'use client'

import { ComponentProps } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/context/auth'

import { cn } from '@/lib/utils'
import { getLikeByUserService } from '@/services/api/likes/get-like-by-user'

import { Review } from '@/types/supabase/reviews'
import { useLanguage } from '@/context/language'

import { useLike } from '@/hooks/use-like'
import { useReviews } from '@/hooks/use-reviews/use-reviews'

type ReviewItemActionsProps = {
  review: Review
  openReplyForm: boolean
  setOpenReplyForm: (param: boolean) => void
}

type ReviewItemActionProps = {
  disabled?: boolean
  active?: boolean
} & ComponentProps<'div'>

const ReviewItemAction = ({
  disabled,
  active,
  className,
  ...props
}: ReviewItemActionProps) => {
  return (
    <span
      className={cn(
        'cursor-pointer text-xs text-muted-foreground underline-offset-1 hover:underline',
        disabled && 'pointer-events-none animate-pulse opacity-50',
        active && 'font-bold text-foreground',
        className,
      )}
      {...props}
    >
      {props.children}
    </span>
  )
}

export const ReviewItemActions = ({
  openReplyForm,
  setOpenReplyForm,
  review,
}: ReviewItemActionsProps) => {
  const { user } = useAuth()
  const { handleLike, handleRemoveLike } = useLike()
  const { dictionary } = useLanguage()
  const { invalidateQueries } = useReviews()

  const { data: likes } = useQuery({
    queryKey: ['likes', review.id],
    queryFn: async () =>
      getLikeByUserService({
        userId: user?.id,
        entityType: 'REVIEW',
        id: review.id,
      }),
  })

  const userLike = likes?.data?.find((like) => like.user_id === user?.id)
  const isUserLiked = Boolean(userLike)

  const isLikeDisabled = isUserLiked
    ? handleRemoveLike.isPending
    : handleLike.isPending

  if (!user) return null

  function handleLikeClick() {
    if (!user) return

    handleLike.mutate(
      {
        reviewId: review.id,
        userId: user.id,
        entityType: 'REVIEW',
      },
      {
        onSuccess: () => {
          invalidateQueries(review.id)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  function handleDeleteLikeClick() {
    if (!user) return

    handleRemoveLike.mutate(
      {
        reviewId: review.id,
        userId: user.id,
        entityType: 'REVIEW',
      },
      {
        onSuccess: () => {
          invalidateQueries(review.id)
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  return (
    <div>
      <div className="flex items-center space-x-2">
        <ReviewItemAction
          active={isUserLiked}
          disabled={isLikeDisabled}
          onClick={() => {
            if (isUserLiked) {
              handleDeleteLikeClick()
              return
            }

            handleLikeClick()
          }}
        >
          {dictionary.review_item_actions.like}
        </ReviewItemAction>

        <span className="h-1 w-1 rounded-full bg-muted-foreground" />

        <ReviewItemAction onClick={() => setOpenReplyForm(!openReplyForm)}>
          {dictionary.review_item_actions.reply}
        </ReviewItemAction>
      </div>
    </div>
  )
}
