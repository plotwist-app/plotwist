'use client'

import { ComponentProps, useState } from 'react'
import { toast } from 'sonner'

import { APP_QUERY_CLIENT } from '@/context/app/app'
import { useAuth } from '@/context/auth'

import { cn } from '@/lib/utils'

import { ReviewReply } from '@/types/supabase/reviews'
import { useLanguage } from '@/context/language'
import { useQuery } from '@tanstack/react-query'
import { useReplies } from '@/hooks/use-replies/use-replies'

import { MediaType } from '@/types/supabase/media-type'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { MovieDetails } from '@/services/tmdb/requests/movies/details'
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
import { getLikeByUserService } from '@/services/api/likes/get-like-by-user'

type TmdbItem = TvSeriesDetails | MovieDetails

type ReviewItemActionsProps = {
  reply: ReviewReply
  tmdbItem: TmdbItem
  mediaType: MediaType
}

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
        active && 'font-bold text-foreground',
      )}
      {...props}
    >
      {props.children}
    </span>
  )
}

export const ReviewReplyActions = ({
  reply: { id, user_id: userId },
  mediaType,
  tmdbItem,
}: ReviewItemActionsProps) => {
  const { user } = useAuth()
  const { handleDeleteReply } = useReplies()
  const { handleLike, handleRemoveLike } = useLike()
  const { dictionary } = useLanguage()

  const [openModal, setOpenModal] = useState(false)

  const { data: likes } = useQuery({
    queryKey: ['likes', id],
    queryFn: async () =>
      getLikeByUserService({ userId: user?.id, entityType: 'REPLY', id }),
  })

  if (!user) return <></>

  const isUserOwner = user.id === userId

  const userLike = likes?.data?.find((like) => like.user_id === user.id)
  const isUserLiked = Boolean(userLike)

  const invalidateQuery = () => {
    const queries = [[tmdbItem.id, mediaType], [id]]

    queries.map((queryKey) =>
      APP_QUERY_CLIENT.invalidateQueries({
        queryKey,
      }),
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <ReplyAction
          active={isUserLiked}
          disabled={
            isUserLiked ? handleRemoveLike.isPending : handleLike.isPending
          }
          onClick={() => {
            if (isUserLiked) {
              handleRemoveLike.mutateAsync(
                { replyId: id, userId, entityType: 'REPLY' },
                {
                  onSuccess: () => {
                    invalidateQuery()
                  },
                },
              )

              return
            }

            handleLike.mutateAsync(
              {
                replyId: id,
                userId: user.id,
                entityType: 'REPLY',
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
          {dictionary.review_reply_actions.like}
        </ReplyAction>

        {isUserOwner && (
          <>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />

            <ReplyAction
              disabled={handleDeleteReply.isPending}
              onClick={() => setOpenModal(true)}
            >
              {dictionary.review_reply_actions.delete}
            </ReplyAction>
          </>
        )}
      </div>

      <Dialog onOpenChange={setOpenModal} open={openModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-1">
            <DialogTitle>
              {dictionary.review_reply_actions.dialog_title}
            </DialogTitle>
            <DialogDescription>
              {dictionary.review_reply_actions.dialog_description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:flex-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {dictionary.review_reply_actions.dialog_close}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() =>
                handleDeleteReply.mutateAsync(
                  { replyId: id },
                  {
                    onSuccess: () => {
                      invalidateQuery()

                      toast.success(
                        dictionary.review_reply_actions.delete_success,
                      )
                    },
                    onError: (error) => {
                      toast.error(error.message)
                    },
                  },
                )
              }
            >
              {dictionary.review_reply_actions.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
