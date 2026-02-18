import { insertReviewReply } from '@/db/repositories/review-replies-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import {
  getPostgresError,
  isForeignKeyViolation,
} from '@/db/utils/postgres-errors'
import type { InsertReviewReplyModel } from '@/domain/entities/review-reply'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { UserNotFoundError } from '@/domain/errors/user-not-found'

const createReviewReplyServiceImpl = async (
  params: InsertReviewReplyModel
) => {
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

export const createReviewReplyService = withServiceTracing(
  'create-review-reply',
  createReviewReplyServiceImpl
)
