import { FullReview } from '@/components/full-review'
import { getProfileReviews } from '@/services/api/profiles'
import { Language } from '@/types/languages'

type UserReviewsProps = {
  userId: string
  language: Language
}

export const UserReviews = async ({ userId, language }: UserReviewsProps) => {
  const reviews = await getProfileReviews(userId, language)

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <FullReview language={language} review={review} key={review.id} />
      ))}
    </div>
  )
}
