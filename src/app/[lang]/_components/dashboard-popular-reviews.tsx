'use client'

import { useQuery } from '@tanstack/react-query'

import { DashboardReview, DashboardReviewSkeleton } from './dashboard-review'
import { useLanguage } from '@/context/language'
import { getPopularReviewsService } from '@/services/api/reviews/get-popular-reviews'

const MAX_REVIEWS = 5

export const DashboardPopularReviews = () => {
  const { language, dictionary } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard-popular-reviews'],
    queryFn: async () => getPopularReviewsService(),
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

  if (!response) return <></>

  const reviews = response

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {dictionary.dashboard.popular_reviews.title}
      </h3>

      <div className="space-y-8">
        {reviews.map((review) => (
          <DashboardReview
            username={review.user_info.raw_user_meta_data.username}
            key={review.id}
            review={review}
            likes={review.likes_count ?? 0}
            language={language}
          />
        ))}
      </div>
    </div>
  )
}
