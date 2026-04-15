import { selectReviewsCount } from '@/infra/db/repositories/reviews-repository'

export async function getUserReviewsCountService(userId: string) {
  const [{ count }] = await selectReviewsCount(userId)

  return { reviewsCount: count }
}
