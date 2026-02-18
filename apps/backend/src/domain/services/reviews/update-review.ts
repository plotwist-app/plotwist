import { updateReview } from '@/db/repositories/reviews-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type {
  reviewParamsSchema,
  updateReviewBodySchema,
} from '@/http/schemas/reviews'

export type UpdateReviewInput = typeof updateReviewBodySchema._type &
  typeof reviewParamsSchema._type

const updateReviewServiceImpl = async (input: UpdateReviewInput) => {
  const [review] = await updateReview(input)

  return { review }
}

export const updateReviewService = withServiceTracing(
  'update-review',
  updateReviewServiceImpl
)
