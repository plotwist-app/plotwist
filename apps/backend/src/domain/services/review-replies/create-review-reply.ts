import type { InsertReviewReplyModel } from '@/domain/entities/review-reply'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { insertReviewReply } from '@/infra/db/repositories/review-replies-repository'
import {
  getPostgresError,
  isForeignKeyViolation,
} from '@/infra/db/utils/postgres-errors'

export async function createReviewReplyService(params: InsertReviewReplyModel) {
  try {
    const [reviewReply] = await insertReviewReply(params)

    return { reviewReply }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      const pgError = getPostgresError(error)
      if (
        pgError?.constraint_name === 'review_replies_review_id_reviews_id_fk'
      ) {
        return new ReviewNotFoundError()
      }

      if (pgError?.constraint_name === 'review_replies_user_id_users_id_fk') {
        return new UserNotFoundError()
      }
    }

    throw error
  }
}
