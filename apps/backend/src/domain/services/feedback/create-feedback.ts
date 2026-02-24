import type { InsertFeedbackModel } from '@/domain/entities/feedback'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { insertFeedback } from '@/infra/db/repositories/feedback-repository'
import { isForeignKeyViolation } from '@/infra/db/utils/postgres-errors'

export async function createFeedbackService(params: InsertFeedbackModel) {
  try {
    const [feedback] = await insertFeedback(params)
    return { feedback }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return new UserNotFoundError()
    }
    throw error
  }
}
