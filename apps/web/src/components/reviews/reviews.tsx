'use client'

import {
  ReviewItem,
  ReviewItemSkeleton,
} from '@/components/reviews/review-item'

import { useGetReviews } from '@/api/reviews'
import type { MediaType } from '@/types/supabase/media-type'
import { v4 } from 'uuid'

export type ReviewsProps = {
  tmdbId: number
  mediaType: MediaType
}

export const Reviews = ({ tmdbId, mediaType }: ReviewsProps) => {
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

  if (!data) return <></>

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
