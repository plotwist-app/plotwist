'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useGetDetailedReviewsInfinite } from '@/api/reviews'
import { FullReview, FullReviewSkeleton } from '@/components/full-review'
import { useLanguage } from '@/context/language'
import { EmptyReview } from '../../home/_components/user-last-review'
import { useLayoutContext } from '../_context'

export const Reviews = () => {
  const { language } = useLanguage()
  const { userId } = useLayoutContext()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetDetailedReviewsInfinite(
      { language, userId, limit: '20' },
      {
        query: {
          getNextPageParam: lastPage => {
            if (!lastPage.pagination?.hasMore) return undefined
            return lastPage.pagination.page + 1
          },
          initialPageParam: 1,
        },
      }
    )

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const reviews = data?.pages.flatMap(page => page.reviews) ?? []

  if (!data) {
    return (
      <div className="space-y-6">
        <FullReviewSkeleton />
        <FullReviewSkeleton />
        <FullReviewSkeleton />
      </div>
    )
  }

  if (reviews.length === 0) {
    return <EmptyReview />
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <FullReview review={review} key={review.id} />
      ))}

      {hasNextPage && (
        <div ref={ref} className="space-y-6">
          <FullReviewSkeleton />
          {isFetchingNextPage && <FullReviewSkeleton />}
        </div>
      )}
    </div>
  )
}
