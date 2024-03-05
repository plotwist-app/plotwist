'use client'

import { ComponentProps, useState } from 'react'
import { toast } from 'sonner'

import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useAuth } from '@/context/auth'

import { useReviews } from '@/hooks/use-reviews/use-reviews'
import { cn } from '@/lib/utils'

import { Review } from '@/types/supabase/reviews'
import { useLanguage } from '@/context/language'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase'
import { useLike } from '@/hooks/use-like/use-like'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
  review: { user_id: userId, id, tmdb_id: tmdbId, media_type: mediaType },
}: ReviewItemActionsProps) => {
  const { user } = useAuth()
  const { handleDeleteReview } = useReviews()
  const { handleLike, handleRemoveLike } = useLike()
  const { dictionary } = useLanguage()

  const [openModal, setOpenModal] = useState(false)

  const { data: likes } = useQuery({
    queryKey: ['likes', id],
    queryFn: async () =>
      supabase
        .from('likes')
        .select('user_id')
        .eq('entity_type', 'REVIEW')
        .eq('review_id', id)
        .eq('user_id', user?.id),
  })

  const isUserOwner = user?.id === userId
  const userLike = likes?.data?.find((like) => like.user_id === user?.id)
  const isUserLiked = Boolean(userLike)

  const invalidateQuery = () => {
    const queries = [
      ['dashboard-user-last-review'],
      ['dashboard-popular-reviews'],
      ['likes', id],
      [tmdbId, mediaType],
    ]

    queries.map((queryKey) =>
      APP_QUERY_CLIENT.invalidateQueries({
        queryKey,
      }),
    )
  }

  return (
    <div>
      <div className="flex items-center space-x-2">
        <ReviewItemAction
          active={isUserLiked}
          disabled={
            isUserLiked ? handleRemoveLike.isPending : handleLike.isPending
          }
          onClick={() => {
            if (!user) return

            if (isUserLiked) {
              handleRemoveLike.mutateAsync(
                {
                  reviewId: id,
                  userId: user.id,
                  entityType: 'REVIEW',
                },
                {
                  onSuccess: () => {
                    invalidateQuery()
                  },
                  onError: (error) => {
                    toast.error(error.message)
                  },
                },
              )
              return
            }

            handleLike.mutateAsync(
              {
                reviewId: id,
                userId: user.id,
                entityType: 'REVIEW',
              },
              {
                onSuccess: () => {
                  invalidateQuery()
                },
                onError: (error) => {
                  toast.error(error.message)
                },
              },
            )
          }}
        >
          {dictionary.review_item_actions.like}
        </ReviewItemAction>

        <span className="h-1 w-1 rounded-full bg-muted-foreground" />

        <ReviewItemAction onClick={() => setOpenReplyForm(!openReplyForm)}>
          {dictionary.review_item_actions.reply}
        </ReviewItemAction>

        {isUserOwner && (
          <>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />

            <ReviewItemAction
              disabled={handleDeleteReview.isPending}
              onClick={() => setOpenModal(true)}
            >
              {dictionary.review_item_actions.delete}
            </ReviewItemAction>
          </>
        )}
      </div>

      <Dialog onOpenChange={setOpenModal} open={openModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-1">
            <DialogTitle>
              {dictionary.review_item_actions.dialog_title}
            </DialogTitle>
            <DialogDescription>
              {dictionary.review_item_actions.dialog_description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {dictionary.review_item_actions.dialog_close}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() =>
                handleDeleteReview.mutateAsync(id, {
                  onSuccess: () => {
                    invalidateQuery()

                    toast.success(dictionary.review_item_actions.delete_success)
                  },
                  onError: (error) => {
                    toast.error(error.message)
                  },
                })
              }
            >
              {dictionary.review_item_actions.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
