import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { getReviewById as getById } from '@/infra/db/repositories/reviews-repository'
export async function getReviewById(id: string) {
  const [review] = await getById(id)

  if (!review) {
    return new ReviewNotFoundError()
  }

  return { review }
}
