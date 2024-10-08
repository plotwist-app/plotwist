'use client'

import Link from 'next/link'

import { Review } from '@/types/supabase/reviews'

import {
  ReviewReplyActions,
  ReviewReplyLikes,
} from '@/components/reviews/review-reply'
import { useLanguage } from '@/context/language'
import { timeFromNow } from '@/utils/date/time-from-now'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { tmdbImage } from '@/utils/tmdb/image'
import { ReplyEditActions } from './review-reply-edit-actions'
import { useAuth } from '@/context/auth'

interface ReviewReplyProps {
  review: Review
  openReplies: boolean
  setOpenReplies: (param: boolean) => void
}

export const ReviewReply = ({
  review,
  openReplies,
  setOpenReplies,
}: ReviewReplyProps) => {
  const { dictionary, language } = useLanguage()
  const { user } = useAuth()

  if (!review.replies) return <></>

  return (
    <div className="pt-2">
      <button
        onClick={() => setOpenReplies(!openReplies)}
        className="flex items-center self-start text-sm text-muted-foreground"
        type="button"
      >
        <div className="mr-4 w-6 border" />

        {!openReplies
          ? `${dictionary.review_reply.open_replies} (${review.replies.length})`
          : `${dictionary.review_reply.hide_replies}`}
      </button>

      {openReplies && (
        <ul className="mt-4 flex flex-col gap-4">
          {review.replies.map((reply) => {
            const { username, image_path: imagePath } = reply.user
            const usernameInitial = username?.at(0)?.toUpperCase()

            const mode = user?.id === reply.user.id ? 'EDIT' : 'SHOW'

            return (
              <li key={reply.id} className="flex items-start space-x-4">
                <Link href={`/${language}/${username}`}>
                  <Avatar className="size-10 border text-[10px] shadow">
                    {imagePath && (
                      <AvatarImage
                        src={tmdbImage(imagePath, 'w500')}
                        className="object-cover"
                      />
                    )}

                    <AvatarFallback>{usernameInitial}</AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex w-full flex-col space-y-2">
                  <div className="flex justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {username}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-muted" />
                      <span className="text-xs text-muted-foreground underline-offset-1 ">
                        {timeFromNow({
                          date: new Date(reply.created_at),
                          language,
                        })}
                      </span>
                    </div>

                    {mode === 'EDIT' && <ReplyEditActions reply={reply} />}
                  </div>

                  <div className="relative space-y-1 rounded-md border p-4 shadow">
                    <p className="text-sm">{reply.reply}</p>
                    <ReviewReplyLikes replyId={reply.id} />
                  </div>

                  <ReviewReplyActions reply={reply} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
