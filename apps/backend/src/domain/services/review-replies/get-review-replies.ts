import { selectReviewReplies } from '@/db/repositories/review-replies-repository'

export async function getReviewRepliesService(
  reviewId: string,
  authenticatedUserId?: string
) {
  const reviewReplies = await selectReviewReplies(reviewId, authenticatedUserId)

  return { reviewReplies }
}
