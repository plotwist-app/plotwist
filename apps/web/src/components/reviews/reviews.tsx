'use client'

import {
  ReviewItem,
  ReviewItemSkeleton,
} from '@/components/reviews/review-item'

import { useGetReviews } from '@/api/reviews'
import { v4 } from 'uuid'

import type { MediaType } from '@/types/media-type'
import { ReviewFormDialog } from './review-form-dialog'
import { useLanguage } from '@/context/language'

export type ReviewsProps = {
  tmdbId: number
  mediaType: MediaType
}

export const Reviews = ({ tmdbId, mediaType }: ReviewsProps) => {
  const { dictionary } = useLanguage()
  const { data, isLoading } = useGetReviews({
    tmdbId: String(tmdbId),
    mediaType,
    orderBy: 'createdAt',
  })

  if (isLoading) {
    return (
      <section className="space-y-8">
        {Array.from({ length: 5 }).map(_ => (
          <ReviewItemSkeleton key={v4()} />
        ))}
      </section>
    )
  }

  if (!data || data.length === 0)
    return (
      <ReviewFormDialog tmdbId={tmdbId} mediaType={mediaType}>
        <section className="text-center border border-dashed rounded-lg py-8 cursor-pointer">
          <p className="text-sm lg:text-sm">
            {dictionary.be_the_first_to_leave_your_opinion}
          </p>

          <p className="text-xs lg:text-sm text-muted-foreground">
            {dictionary.click_here_and_share_your_experience}
          </p>
        </section>
      </ReviewFormDialog>
    )

  return (
    <section className="space-y-8">
      {data
        .filter(review => review.review)
        .map(review => (
          <ReviewItem key={review.id} review={review} />
        ))}
    </section>
  )
}
