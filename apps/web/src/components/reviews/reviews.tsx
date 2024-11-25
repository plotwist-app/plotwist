'use client'

import type { MovieDetails, TvSerieDetails } from '@/services/tmdb'

import { ReviewForm } from '@/components/reviews/review-form'
import {
  ReviewItem,
  ReviewItemSkeleton,
} from '@/components/reviews/review-item'

import { useGetReviews } from '@/api/reviews'
import { useLanguage } from '@/context/language'
import type { MediaType } from '@/types/supabase/media-type'
import { v4 } from 'uuid'

type TmdbItem = TvSerieDetails | MovieDetails

export type ReviewsProps = {
  tmdbItem: TmdbItem
  mediaType: MediaType
}

export const Reviews = ({ tmdbItem, mediaType }: ReviewsProps) => {
  const { data, isLoading } = useGetReviews({
    tmdbId: String(tmdbItem.id),
    mediaType,
    orderBy: 'createdAt',
  })

  if (isLoading) {
    return (
      <section className="space-y-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <ReviewItemSkeleton key={v4()} />
        ))}
      </section>
    )
  }

  if (!data) return <></>

  return (
    <section className="space-y-8">
      {data.map(review => (
        <ReviewItem key={review.id} review={review} />
      ))}

      <ReviewForm mediaType={mediaType} tmdbItem={tmdbItem} />
    </section>
  )
}
