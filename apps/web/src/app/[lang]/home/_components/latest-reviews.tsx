'use client'

import Link from 'next/link'

import { useGetDetailedReviews } from '@/api/reviews'
import { FullReview, FullReviewSkeleton } from '@/components/full-review'
import { useLanguage } from '@/context/language'
import { v4 } from 'uuid'

const MAX_SKELETONS_REVIEWS = 5

export const LatestReviews = () => {
  const { language, dictionary } = useLanguage()

  const { isLoading, data } = useGetDetailedReviews({
    language,
    userId: undefined,
    limit: '5',
    orderBy: 'likeCount',
  })

  console.log

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {dictionary.latest_reviews.title}
          </h3>
        </div>

        <div className="space-y-4">
          {Array.from({ length: MAX_SKELETONS_REVIEWS }).map((_, index) => (
            <FullReviewSkeleton key={v4()} />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {dictionary.latest_reviews.title}
        </h3>
      </div>

      <div className="space-y-4">
        {data.reviews.length > 0 ? (
          data.reviews.map(review => (
            <FullReview key={review.id} review={review} language={language} />
          ))
        ) : (
          <div className="lg:text-md flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm">
            <p>{dictionary.latest_reviews.no_reviews_found}</p>

            <Link
              className="lg:text-md text-sm text-muted-foreground hover:underline"
              href={`/${language}/movies/popular`}
            >
              {dictionary.latest_reviews.explore_popular_movies}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
