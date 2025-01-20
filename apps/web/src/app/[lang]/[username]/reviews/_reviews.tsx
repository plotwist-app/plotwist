'use client'

import { useGetDetailedReviewsSuspense } from '@/api/reviews'
import { FullReview } from '@/components/full-review'
import { useLanguage } from '@/context/language'
import { EmptyReview } from '../../home/_components/user-last-review'
import { useLayoutContext } from '../_context'

export const Reviews = () => {
  const { language } = useLanguage()
  const { userId } = useLayoutContext()
  const { data } = useGetDetailedReviewsSuspense({
    language,
    userId,
  })

  if (data.reviews.length === 0) {
    return <EmptyReview />
  }

  return (
    <div className="space-y-6">
      {data.reviews.map(review => (
        <FullReview review={review} key={review.id} />
      ))}
    </div>
  )
}
