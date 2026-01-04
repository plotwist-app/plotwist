import { insertReview } from '@/db/repositories/reviews-repository'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import postgres from 'postgres'
import type { InsertReviewModel } from '../../entities/review'

export async function createReviewService(params: InsertReviewModel) {
  try {
    const [review] = await insertReview(params)

    return { review }
  } catch (error) {
    if (error instanceof postgres.PostgresError) {
      if (error.code === PgIntegrityConstraintViolation.ForeignKeyViolation) {
        return new UserNotFoundError()
      }
    }

    throw error
  }
}
