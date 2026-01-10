import postgres from 'postgres'
import { insertReviewReply } from '@/db/repositories/review-replies-repository'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import type { InsertReviewReplyModel } from '@/domain/entities/review-reply'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { UserNotFoundError } from '@/domain/errors/user-not-found'

export async function createReviewReplyService(params: InsertReviewReplyModel) {
  try {
    const [reviewReply] = await insertReviewReply(params)

    return { reviewReply }
  } catch (error) {
    if (error instanceof postgres.PostgresError) {
      if (error.code === PgIntegrityConstraintViolation.ForeignKeyViolation) {
        if (
          error.constraint_name === 'review_replies_review_id_reviews_id_fk'
        ) {
          return new ReviewNotFoundError()
        }

        if (error.constraint_name === 'review_replies_user_id_users_id_fk') {
          return new UserNotFoundError()
        }
      }
    }

    throw error
  }
}
