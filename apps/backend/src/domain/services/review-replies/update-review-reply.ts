import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { updateReviewReply as updateReviewReplyRepository } from '@/infra/db/repositories/review-replies-repository'

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
