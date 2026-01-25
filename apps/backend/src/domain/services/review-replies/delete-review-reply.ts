import { deleteReviewReply as deleteReviewReplyRepository } from '@/db/repositories/review-replies-repository'
import { ReviewReplyNotFoundError } from '@/domain/errors/review-reply-not-found-error'

export async function deleteReviewReply(id: string) {
  const [deletedReply] = await deleteReviewReplyRepository(id)

  if (!deletedReply) {
    return new ReviewReplyNotFoundError()
  }

  return { reviewReply: deletedReply }
}
