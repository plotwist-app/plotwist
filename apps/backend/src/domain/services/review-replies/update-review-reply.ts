import { updateReviewReply as updateReviewReplyRepository } from '@/db/repositories/review-replies-repository'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'

export async function updateReviewReply(id: string, reply: string) {
  try {
    const [reviewReply] = await updateReviewReplyRepository(id, reply)

    if (!reviewReply) {
      return new ReviewNotFoundError()
    }

    return { reviewReply }
  } catch {
    return new ReviewNotFoundError()
  }
}
