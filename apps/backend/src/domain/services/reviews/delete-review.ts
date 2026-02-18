import { deleteReview } from '@/db/repositories/reviews-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'

const deleteReviewServiceImpl = async (id: string) => {
  const [review] = await deleteReview(id)

  if (!review) {
    return new ReviewNotFoundError()
  }

  return review
}

export const deleteReviewService = withServiceTracing(
  'delete-review',
  deleteReviewServiceImpl
)
