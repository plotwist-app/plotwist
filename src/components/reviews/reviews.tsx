'use client'

import { MediaType } from '@/types/supabase/media-type'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { useQuery } from '@tanstack/react-query'
import {
  ReviewItem,
  ReviewItemSkeleton,
} from '@/components/reviews/review-item'
import { ReviewForm } from '@/components/reviews/review-form'
import { getReviewsService } from '@/services/api/reviews/get-reviews'

type TmdbItem = TvSeriesDetails | MovieDetails

export type ReviewsProps = {
  tmdbItem: TmdbItem
  mediaType: MediaType
}

export const Reviews = ({ tmdbItem, mediaType }: ReviewsProps) => {
  const { data, isLoading } = useQuery({
    queryKey: [tmdbItem.id, mediaType],
    queryFn: async () => getReviewsService({ id: tmdbItem.id, mediaType }),
  })

  if (isLoading) {
    return (
      <section className="space-y-8">
        {Array.from({ length: 5 }).map((_, index) => (
          <ReviewItemSkeleton key={index} />
        ))}
      </section>
    )
  }

  if (!data) return <></>

  return (
    <section className="space-y-8">
      {data.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          tmdbItem={tmdbItem}
          mediaType={mediaType}
        />
      ))}

      <ReviewForm mediaType={mediaType} tmdbItem={tmdbItem} />
    </section>
  )
}
