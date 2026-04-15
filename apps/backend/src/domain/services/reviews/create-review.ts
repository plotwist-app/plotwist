import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { insertReview } from '@/infra/db/repositories/reviews-repository'
import { isForeignKeyViolation } from '@/infra/db/utils/postgres-errors'
import type { InsertReviewModel } from '../../entities/review'

export async function createReviewService(params: InsertReviewModel) {
  try {
    const [review] = await insertReview(params)

    return { review }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return new UserNotFoundError()
    }

    throw error
  }
}
