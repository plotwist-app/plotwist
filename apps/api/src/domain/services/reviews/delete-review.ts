import { deleteReview } from '@/db/repositories/reviews-repository'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'

export async function deleteReviewService(id: string) {
  const [review] = await deleteReview(id)

  if (!review) {
    return new ReviewNotFoundError()
  }

  return review
}
