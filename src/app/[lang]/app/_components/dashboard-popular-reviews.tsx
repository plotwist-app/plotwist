'use client'

import { supabase } from '@/services/supabase'
import { Review } from '@/types/supabase/reviews'
import { useQuery } from '@tanstack/react-query'

import { DashboardReview, DashboardReviewSkeleton } from './dashboard-review'
import { useLanguage } from '@/context/language'

const MAX_REVIEWS = 5

export const DashboardPopularReviews = () => {
  const { language, dictionary } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard-popular-reviews'],
    queryFn: async () =>
      await supabase
        .from('reviews_with_user_and_like_count')
        .select()
        .order('review_likes_count', { ascending: false })
        .limit(MAX_REVIEWS)
        .returns<Review[]>(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {dictionary.dashboard.popular_reviews.title}
        </h3>

        <div className="space-y-8">
          {Array.from({ length: MAX_REVIEWS }).map((_, index) => (
            <DashboardReviewSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (!response?.data) return <></>

  const reviews = response.data

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {dictionary.dashboard.popular_reviews.title}
      </h3>

      <div className="space-y-8">
        {reviews.map((review) => (
          <DashboardReview
            key={review.id}
            review={review}
            language={language}
          />
        ))}
      </div>
    </div>
  )
}
