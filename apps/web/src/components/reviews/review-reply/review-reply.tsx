'use client'

import { useLanguage } from '@/context/language'

import { useGetReviewReplies } from '@/api/review-replies'
import { Likes } from '@/components/likes'
import { useSession } from '@/context/session'
import { timeFromNow } from '@/utils/date/time-from-now'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import Link from 'next/link'
import { ReviewReplyActions } from './review-reply-actions'
import { ReplyEditActions } from './review-reply-edit-actions'

type ReviewReplyProps = {
  openReplies: boolean
  setOpenReplies: (param: boolean) => void
  replyCount: number
  reviewId: string
}

export const ReviewReply = ({
  openReplies,
  setOpenReplies,
  replyCount,
  reviewId,
}: ReviewReplyProps) => {
  const { dictionary, language } = useLanguage()
  const { data, isLoading } = useGetReviewReplies(
    { reviewId },
    { query: { enabled: openReplies } }
  )
  const session = useSession()

  if (replyCount === 0) return <></>
  if (isLoading) return <></>

  return (
    <div className="pt-2">
      <button
        onClick={() => setOpenReplies(!openReplies)}
        className="flex items-center self-start text-sm text-muted-foreground"
        type="button"
      >
        <div className="mr-4 w-6 border" />

        {!openReplies
          ? `${dictionary.review_reply.open_replies} (${replyCount})`
          : `${dictionary.review_reply.hide_replies}`}
      </button>

      {openReplies && (
        <ul className="mt-4 flex flex-col gap-4">
          {data?.map(reply => {
            const { username, avatarUrl } = reply.user
            const usernameInitial = username?.at(0)?.toUpperCase()

            const mode = session.user?.id === reply.userId ? 'EDIT' : 'SHOW'

            return (
              <li key={reply.id} className="flex items-start space-x-4">
                <Link href={`/${language}/${username}`}>
                  <Avatar className="size-10 border text-[10px]">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} className="object-cover" />
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
                          date: new Date(reply.createdAt),
                          language,
                        })}
                      </span>
                    </div>

                    {mode === 'EDIT' && <ReplyEditActions reply={reply} />}
                  </div>

                  <div className="relative space-y-1 rounded-md border p-4">
                    <p className="text-sm">{reply.reply}</p>

                    <Likes
                      entityId={reply.id}
                      likeCount={reply.likeCount}
                      className="absolute -bottom-3.5 right-2 bg-muted"
                    />
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
