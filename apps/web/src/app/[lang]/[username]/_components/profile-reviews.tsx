import { FullReview } from '@/components/full-review'
import { Language } from '@/types/languages'
import { EmptyReview } from '../../_components/user-last-review'
import { FullReview as FullReviewType } from '@/services/api/reviews'

type ProfileReviewsProps = {
  reviews: FullReviewType[]
  language: Language
}

export const ProfileReviews = ({ reviews, language }: ProfileReviewsProps) => {
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
