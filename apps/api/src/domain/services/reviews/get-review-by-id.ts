import { getReviewById as getById } from '@/db/repositories/reviews-repository'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
export async function getReviewById(id: string) {
  const [review] = await getById(id)

  if (!review) {
    return new ReviewNotFoundError()
  }

  return { review }
}
