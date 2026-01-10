'use client'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { Rating } from '@plotwist/ui/components/ui/rating'
import { formatDistanceToNow } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { GetReviews200Item } from '@/api/endpoints.schemas'
import { Likes } from '@/components/likes'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'
import { locale } from '@/utils/date/locale'
import { ReviewReply } from '../review-reply'
import { ReviewReplyForm } from '../review-reply/review-reply-form'
import { ReviewItemActions } from './review-item-actions'
import { ReviewItemEditActions } from './review-item-edit-actions'

export type ReviewItemProps = {
  review: GetReviews200Item
}

export const ReviewItem = ({ review }: ReviewItemProps) => {
  const {
    review: content,
    rating,
    hasSpoilers,
    createdAt,
    user: { username, avatarUrl },
    userId,
    id,
  } = review

  const { language, dictionary } = useLanguage()
  const { user } = useSession()
  const reviewRef = useRef<HTMLDivElement>(null)
  const reviewToFocus = useSearchParams().get('review')

  const [openReplyForm, setOpenReplyForm] = useState(false)
  const [openReplies, setOpenReplies] = useState(false)
  const [focusReview, setFocusReview] = useState(false)
  const [wasFocusDisabled, setFocusWasDisabled] = useState(false)
  const [showSpoiler, setShowSpoiler] = useState(false)

  const usernameInitial = username?.at(0)?.toUpperCase()
  const time = `${formatDistanceToNow(new Date(createdAt), {
    locale: locale[language],
  })} ${dictionary.ago}`

  const mode = useMemo(() => {
    if (user?.id === userId) return 'EDIT'

    return 'SHOW'
  }, [user?.id, userId])

  useEffect(() => {
    if (reviewToFocus === id && !focusReview && !wasFocusDisabled) {
      setFocusReview(true)
      reviewRef.current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      })
    }
  }, [id, reviewToFocus, focusReview, wasFocusDisabled])

  return (
    <div ref={reviewRef} className="flex items-start space-x-4">
      <Link href={`/${language}/${username}`}>
        <Avatar className="h-10 w-10 border text-[10px] ">
          {avatarUrl && (
            <AvatarImage
              src={avatarUrl}
              className="object-cover"
              alt={username}
            />
          )}

          <AvatarFallback>{usernameInitial}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex max-w-[calc(100%-56px)] flex-1 flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{username}</span>
            <span className="h-1 w-1 rounded-full bg-muted" />
            <Rating defaultRating={rating} editable={false} />

            <span className="hidden h-1 w-1 rounded-full bg-muted md:block" />
            <span className="hidden text-xs text-muted-foreground underline-offset-1 md:block">
              {time}
            </span>
          </div>

          {mode === 'EDIT' && <ReviewItemEditActions review={review} />}
        </div>

        <div className="relative">
          <div
            onMouseEnter={() => {
              setFocusReview(false)
              setFocusWasDisabled(true)
            }}
            className={cn(
              'relative space-y-1 rounded-md border p-4 overflow-hidden',
              focusReview && 'border-none p-0'
            )}
          >
            <div
              className={cn(
                focusReview &&
                  'group relative grid overflow-hidden rounded-md p-4 shadow-[0_1000px_0_0_hsl(0_0%_85%)_inset] transition-colors duration-200 dark:shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset]'
              )}
            >
              {focusReview && (
                <>
                  <span>
                    <span className="spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-md [mask:linear-gradient(white,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:rotate-[-90deg] before:animate-rotate before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%]" />
                  </span>

                  <span className="backdrop absolute inset-px rounded-md bg-white transition-colors duration-200 dark:bg-neutral-950" />
                </>
              )}

              <p
                className={cn(
                  'z-10 break-words text-sm/6 relative',
                  hasSpoilers &&
                    'after:w-full after:h-full after:absolute after:inset-0 after:z-10 after:bg-muted dark:after:hover:brightness-110  after:rounded-sm cursor-pointer after:hover:brightness-95 after:transition-all',
                  showSpoiler && 'after:bg-muted/50 after:-z-10'
                )}
                onClick={() => setShowSpoiler(!showSpoiler)}
                onKeyDown={() => setShowSpoiler(!showSpoiler)}
              >
                {content}
              </p>
            </div>
          </div>

          <Likes
            likeCount={review.likeCount}
            entityId={review.id}
            className="absolute -bottom-3.5 right-2 bg-muted"
          />
        </div>

        <ReviewItemActions
          review={review}
          openReplyForm={openReplyForm}
          setOpenReplyForm={setOpenReplyForm}
        />

        <ReviewReply
          replyCount={review.replyCount}
          reviewId={review.id}
          openReplies={openReplies}
          setOpenReplies={setOpenReplies}
        />

        {openReplyForm && (
          <ReviewReplyForm
            onOpenReplyForm={setOpenReplyForm}
            onOpenReplies={setOpenReplies}
            review={review}
          />
        )}
      </div>
    </div>
  )
}
