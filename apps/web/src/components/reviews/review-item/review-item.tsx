'use client'

import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

import { MovieDetails, TvSerieDetails } from '@plotwist/tmdb'

import { ReviewReplyForm } from '@/components/reviews/review-reply-form'
import { ReviewLikes } from '@/components/reviews/review-likes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ReviewReply } from '@/components/reviews/review-reply'

import { ReviewStars } from '../review-stars'

import { MediaType } from '@/types/supabase/media-type'
import { Review } from '@/types/supabase/reviews'

import { useLanguage } from '@/context/language'
import { useAuth } from '@/context/auth'

import { locale } from '@/utils/date/locale'
import { tmdbImage } from '@/utils/tmdb/image'

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
    replies,
    created_at: createdAt,
    user: { username, image_path: imagePath },
    user_id: userId,
  } = review

  const {
    language,
    dictionary: {
      review_item: { ago },
    },
  } = useLanguage()
  const { user } = useAuth()

  const [openReplyForm, setOpenReplyForm] = useState(false)
  const [openReplies, setOpenReplies] = useState(false)

  const usernameInitial = username[0].toUpperCase()
  const time = `${formatDistanceToNow(new Date(createdAt), {
    locale: locale[language],
  })} ${ago}`

  const mode = useMemo(() => {
    if (user?.id === userId) return 'EDIT'

    return 'SHOW'
  }, [user?.id, userId])

  return (
    <div className="flex items-start space-x-4">
      <Link href={`/${language}/${username}`}>
        <Avatar className="h-10 w-10 border text-[10px] shadow">
          {imagePath && (
            <AvatarImage
              src={tmdbImage(imagePath, 'w500')}
              className="object-cover"
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

        <div className="relative space-y-1 rounded-md border p-4 shadow">
          <p className="break-words text-sm/6">{content}</p>
          <ReviewLikes reviewId={review.id} />
        </div>

        <ReviewItemActions
          review={review}
          openReplyForm={openReplyForm}
          setOpenReplyForm={setOpenReplyForm}
        />

        <ReviewReply
          replies={replies}
          openReplies={openReplies}
          setOpenReplies={setOpenReplies}
          tmdbItem={tmdbItem}
          mediaType={mediaType}
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
