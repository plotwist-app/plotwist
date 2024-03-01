'use client'

import { MediaType } from '@/types/supabase/media-type'
import { TvSeriesDetails } from '@/services/tmdb/requests/tv-series/details'
import { MovieDetails } from '@/services/tmdb/requests/movies/details'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'
import { Review } from '@/types/supabase/reviews'
import {
  ReviewItem,
  ReviewItemSkeleton,
} from '@/components/reviews/review-item'
import { ReviewForm } from '@/components/reviews/review-form'

type TmdbItem = TvSeriesDetails | MovieDetails

export type ReviewsProps = {
  tmdbItem: TmdbItem
  mediaType: MediaType
}

export const Reviews = ({ tmdbItem, mediaType }: ReviewsProps) => {
  const { data: response, isLoading } = useQuery({
    queryKey: [tmdbItem.id, mediaType],
    queryFn: async () =>
      supabase
        .from('reviews_with_replies')
        .select('*')
        .eq('tmdb_id', tmdbItem.id)
        .order('id', { ascending: false })
        .eq('media_type', mediaType)
        .returns<Review[]>(),
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

  if (!response?.data) return <></>

  return (
    <section className="space-y-8">
      {response.data.map((review) => (
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
