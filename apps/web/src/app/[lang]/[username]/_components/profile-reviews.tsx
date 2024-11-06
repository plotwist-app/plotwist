'use client'

import { FullReview, FullReviewSkeleton } from '@/components/full-review'
import { useQuery } from '@tanstack/react-query'
import { getProfileReviews } from '@/services/api/profiles'
import { useLanguage } from '@/context/language'
import { EmptyReview } from '../../home/_components/user-last-review'

type ProfileReviewsProps = {
  userId: string
}

export const ProfileReviews = ({ userId }: ProfileReviewsProps) => {
  const { language } = useLanguage()

  const { data: reviews, isLoading } = useQuery({
    queryFn: async () => await getProfileReviews({ language, userId }),
    queryKey: ['reviews'],
  })

  if (!reviews || isLoading) {
    return <FullReviewSkeleton />
  }

  return (
    <div className="space-y-4">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <FullReview language={language} review={review} key={review.id} />
        ))
      ) : (
        <EmptyReview />
      )}
    </div>
  )
}
