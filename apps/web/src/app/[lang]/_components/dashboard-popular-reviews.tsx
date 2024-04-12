'use client'

import { useQuery } from '@tanstack/react-query'

import { useLanguage } from '@/context/language'
import { getPopularReviewsService } from '@/services/api/reviews/get-popular-reviews'
import Link from 'next/link'
import { FullReview, FullReviewSkeleton } from '@/components/full-review'

const MAX_SKELETONS_REVIEWS = 5

export const DashboardPopularReviews = () => {
  const { language, dictionary } = useLanguage()

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['dashboard-popular-reviews'],
    queryFn: async () => getPopularReviewsService(language),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {dictionary.dashboard.popular_reviews.title}
        </h3>

        <div className="space-y-8">
          {Array.from({ length: MAX_SKELETONS_REVIEWS }).map((_, index) => (
            <FullReviewSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (!reviews) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {dictionary.dashboard.popular_reviews.title}
      </h3>

      <div className="space-y-8">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <FullReview key={review.id} review={review} language={language} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
            <p>{dictionary.dashboard.popular_reviews.no_reviews_found}</p>

            <Link
              className="text-xs text-muted-foreground underline"
              href={`/${language}/movies/popular`}
            >
              {dictionary.dashboard.popular_reviews.explore_popular_movies}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
