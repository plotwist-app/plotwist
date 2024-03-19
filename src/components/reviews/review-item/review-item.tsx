'use client'

import { Review } from '@/types/supabase/reviews'
import { ReviewItemActions } from '.'
import { ReviewStars } from '../review-stars'
import { useState } from 'react'
import { ReviewReplyForm } from '@/components/reviews/review-reply-form/review-reply-form'
import { ReviewLikes } from '@/components/reviews/review-likes'

import { MediaType } from '@/types/supabase/media-type'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { ReviewReply } from '@/components/reviews/review-reply'
import { useLanguage } from '@/context/language'
import { formatDistanceToNow } from 'date-fns'
import { locale } from '@/utils/date/locale'

type TmdbItem = TvSeriesDetails | MovieDetails

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
    user_info: {
      raw_user_meta_data: { username },
    },
    review: content,
    rating,
    review_replies: replies,
    created_at: createdAt,
  } = review

  const {
    language,
    dictionary: {
      review_item: { ago },
    },
  } = useLanguage()

  const [openReplyForm, setOpenReplyForm] = useState(false)
  const [openReplies, setOpenReplies] = useState(false)

  const usernameInitial = username[0].toUpperCase()

  return (
    <div className="flex items-start space-x-4">
      <div className="flex aspect-square h-10 w-10 items-center justify-center rounded-full border bg-muted">
        {usernameInitial}
      </div>

      <div className="flex w-full flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{username}</span>
          <span className="h-1 w-1 rounded-full bg-muted" />
          <ReviewStars rating={rating} />
          <span className="h-1 w-1 rounded-full bg-muted" />

          <span className="text-xs text-muted-foreground underline-offset-1 ">
            {formatDistanceToNow(new Date(createdAt), {
              locale: locale[language],
            })}{' '}
            {ago}
          </span>
        </div>

        <div className="relative space-y-1 rounded-md border p-4 shadow">
          <p className="text-sm">{content}</p>

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
