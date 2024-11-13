'use client'

import { useGetDetailedReviews } from '@/api/reviews'
import { useLanguage } from '@/context/language'
import { EmptyReview } from '../../home/_components/user-last-review'
import { FullReview, FullReviewSkeleton } from '@/components/full-review'

type ReviewsProps = {
  userId: string
}

export const Reviews = ({ userId }: ReviewsProps) => {
  const { language } = useLanguage()
  const { data, isLoading } = useGetDetailedReviews({ language, userId })

  if (!data || isLoading) {
    return <FullReviewSkeleton />
  }

  if (data.reviews.length < 0) {
    return <EmptyReview />
  }

  return (
    <div className="space-y-4">
      {data.reviews.map((review) => (
        <FullReview language={language} review={review} key={review.id} />
      ))}
    </div>
  )
}
