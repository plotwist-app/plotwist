import { updateReview } from '@/db/repositories/reviews-repository'
import type {
  reviewParamsSchema,
  updateReviewBodySchema,
} from '@/infra/http/schemas/reviews'

export type UpdateReviewInput = typeof updateReviewBodySchema._type &
  typeof reviewParamsSchema._type

export async function updateReviewService(input: UpdateReviewInput) {
  const [review] = await updateReview(input)

  return { review }
}
