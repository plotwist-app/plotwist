'use client'

import { supabase } from '@/services/supabase'
import { MediaType } from '@/types/supabase/media-type'
import { Review } from '@/types/supabase/reviews'
import { useQuery } from '@tanstack/react-query'

import { ReviewItem } from './review-item'
import { ReviewForm } from './review-form'
import { ReviewItemSkeleton } from './review-item-skeleton'
import { MovieDetails, TvShowDetails } from 'tmdb-ts'

export type ReviewsProps = {
  tmdbItem: TvShowDetails | MovieDetails
  mediaType: MediaType
}

export const Reviews = ({ tmdbItem, mediaType }: ReviewsProps) => {
  const { data: response, isLoading } = useQuery({
    queryKey: [tmdbItem.id, mediaType],
    queryFn: async () =>
      supabase
        .from('reviews_with_user')
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
        <ReviewItem key={review.id} review={review} />
      ))}

      <ReviewForm mediaType={mediaType} tmdbItem={tmdbItem} />
    </section>
  )
}
