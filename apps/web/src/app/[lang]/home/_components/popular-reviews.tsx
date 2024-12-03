'use client'

import Link from 'next/link'

import {
  useGetDetailedReviews,
  useGetDetailedReviewsSuspense,
} from '@/api/reviews'
import { FullReview, FullReviewSkeleton } from '@/components/full-review'
import { useLanguage } from '@/context/language'
import { v4 } from 'uuid'
import { Badge } from '@plotwist/ui/components/ui/badge'
import { useState } from 'react'

const MAX_SKELETONS_REVIEWS = 5

export const PopularReviews = () => {
  const { language, dictionary } = useLanguage()

  const intervals = [
    {
      label: dictionary.today,
      key: 'TODAY',
    },
    {
      label: dictionary.this_week,
      key: 'THIS_WEEK',
    },
    {
      label: dictionary.this_month,
      key: 'THIS_MONTH',
    },
    {
      label: dictionary.all_time,
      key: 'ALL_TIME',
    },
  ] as const

  const [selectedInterval, setSelectedInterval] = useState<
    (typeof intervals)[number]['key']
  >(intervals[0].key)

  const { data, isLoading } = useGetDetailedReviews({
    language,
    userId: undefined,
    limit: '5',
    orderBy: 'likeCount',
    interval: selectedInterval,
  })

  if (!data) return null

  if (isLoading)
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{dictionary.popular_reviews}</h3>

        <div className="flex gap-1 flex-wrap">
          {intervals.map(interval => (
            <Badge
              key={interval.label}
              onClick={() => setSelectedInterval(interval.key)}
              variant={
                selectedInterval === interval.key ? 'default' : 'outline'
              }
              className="cursor-pointer"
            >
              {interval.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {data.reviews.length > 0 ? (
          data.reviews.map(review => (
            <FullReview key={review.id} review={review} />
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
