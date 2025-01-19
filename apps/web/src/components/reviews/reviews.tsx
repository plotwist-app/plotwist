'use client'

import {
  ReviewItem,
  ReviewItemSkeleton,
} from '@/components/reviews/review-item'

import { useGetReviews } from '@/api/reviews'
import { v4 } from 'uuid'

import type { MediaType } from '@/types/media-type'
import { useLanguage } from '@/context/language'
import { ReviewsSummary, ReviewsSummarySkeleton } from './reviews-summary'
import { Suspense } from 'react'

export type ReviewsProps = {
  tmdbId: number
  mediaType: MediaType
}

export const Reviews = ({ tmdbId, mediaType }: ReviewsProps) => {
  const { language } = useLanguage()
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

  return (
    <section className="space-y-6">
      {mediaType === 'MOVIE' && (
        <Suspense fallback={<ReviewsSummarySkeleton />}>
          <ReviewsSummary tmdbId={tmdbId} language={language} />
        </Suspense>
      )}

      {data
        ?.filter(review => review.review)
        .map(review => (
          <ReviewItem key={review.id} review={review} />
        ))}
    </section>
  )
}
