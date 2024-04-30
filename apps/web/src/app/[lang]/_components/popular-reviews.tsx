'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { useLanguage } from '@/context/language'
import {
  GetPopularReviewPeriod,
  getPopularReviewsService,
} from '@/services/api/reviews'
import { FullReview, FullReviewSkeleton } from '@/components/full-review'
import { Badge } from '@/components/ui/badge'

const MAX_SKELETONS_REVIEWS = 5

export const PopularReviews = () => {
  const { language, dictionary } = useLanguage()
  const [period, setPeriod] = useState<GetPopularReviewPeriod>('last_week')

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['popular-reviews', period],
    queryFn: async () => getPopularReviewsService({ language, period }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {dictionary.popular_reviews.title}
          </h3>

          <div className="flex gap-1">
            <Badge
              variant={period === 'last_week' ? 'default' : 'outline'}
              className="cursor-not-allowed opacity-50"
            >
              {dictionary.popular_reviews.last_week}
            </Badge>

            <Badge
              onClick={() => setPeriod('last_month')}
              variant={period === 'last_month' ? 'default' : 'outline'}
              className="cursor-not-allowed opacity-50"
            >
              {dictionary.popular_reviews.last_month}
            </Badge>

            <Badge
              onClick={() => setPeriod('all_time')}
              variant={period === 'all_time' ? 'default' : 'outline'}
              className="cursor-not-allowed opacity-50"
            >
              {dictionary.popular_reviews.all_time}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
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
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {dictionary.popular_reviews.title}
        </h3>

        <div className="flex gap-1">
          <Badge
            onClick={() => setPeriod('last_week')}
            variant={period === 'last_week' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            {dictionary.popular_reviews.last_week}
          </Badge>

          <Badge
            onClick={() => setPeriod('last_month')}
            variant={period === 'last_month' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            {dictionary.popular_reviews.last_month}
          </Badge>

          <Badge
            onClick={() => setPeriod('all_time')}
            variant={period === 'all_time' ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            {dictionary.popular_reviews.all_time}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <FullReview key={review.id} review={review} language={language} />
          ))
        ) : (
          <div className="lg:text-md flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm">
            <p>{dictionary.popular_reviews.no_reviews_found}</p>

            <Link
              className="text-xs text-muted-foreground underline"
              href={`/${language}/movies/popular`}
            >
              {dictionary.popular_reviews.explore_popular_movies}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
