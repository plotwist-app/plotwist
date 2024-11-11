'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import { MovieDetails, TvSerieDetails } from '@/services/tmdb'

import { ReviewLikes } from '@/components/reviews/review-likes'
import { ReviewReply } from '@/components/reviews/review-reply'
import { ReviewReplyForm } from '@/components/reviews/review-reply-form'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { ReviewStars } from '../review-stars'

import { MediaType } from '@/types/supabase/media-type'
import { Review } from '@/types/supabase/reviews'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

import { locale } from '@/utils/date/locale'
import { tmdbImage } from '@/utils/tmdb/image'

import { cn } from '@/lib/utils'

import { ReviewItemActions } from './review-item-actions'
import { ReviewItemEditActions } from './review-item-edit-actions'

type TmdbItem = TvSerieDetails | MovieDetails

type ReviewItemProps = {
  review: Review
  tmdbItem: TmdbItem
  mediaType: MediaType
}

export const ReviewItem = ({
  review,
  tmdbItem,
  mediaType,
}: ReviewItemProps) => {
  const {
    review: content,
    rating,
    has_spoilers: hasSpoilers,
    created_at: createdAt,
    user: { username, image_path: imagePath },
    user_id: userId,
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
        <Avatar className="h-10 w-10 border text-[10px] shadow">
          {imagePath && (
            <AvatarImage
              src={tmdbImage(imagePath, 'w500')}
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
            <ReviewStars rating={rating} />

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
              'relative space-y-1 rounded-md border p-4 shadow overflow-hidden',
              focusReview && 'border-none p-0',
            )}
          >
            <div
              className={cn(
                focusReview &&
                  'group relative grid overflow-hidden rounded-md p-4 shadow-[0_1000px_0_0_hsl(0_0%_85%)_inset] transition-colors duration-200 dark:shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset]',
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
                  showSpoiler && 'after:bg-muted/50 after:-z-10',
                )}
                onClick={() => setShowSpoiler(!showSpoiler)}
              >
                {content}
              </p>
            </div>
          </div>
          <ReviewLikes reviewId={id} />
        </div>

        <ReviewItemActions
          review={review}
          openReplyForm={openReplyForm}
          setOpenReplyForm={setOpenReplyForm}
        />

        <ReviewReply
          review={review}
          openReplies={openReplies}
          setOpenReplies={setOpenReplies}
        />

        {openReplyForm && (
          <ReviewReplyForm
            reviewId={review.id}
            onOpenReplyForm={setOpenReplyForm}
            onOpenReplies={setOpenReplies}
            tmdbItem={tmdbItem}
            mediaType={mediaType}
          />
        )}
      </div>
    </div>
  )
}
