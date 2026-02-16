import { insertFeedback } from '@/db/repositories/feedback-repository'
import { isForeignKeyViolation } from '@/db/utils/postgres-errors'
import type { InsertFeedbackModel } from '@/domain/entities/feedback'
import { UserNotFoundError } from '@/domain/errors/user-not-found'

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
