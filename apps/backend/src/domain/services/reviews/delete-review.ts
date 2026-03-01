import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { deleteReview } from '@/infra/db/repositories/reviews-repository'

export async function deleteReviewService(id: string) {
  const [review] = await deleteReview(id)

  if (!review) {
    return new ReviewNotFoundError()
  }

  return review
}
