import { insertFeedback } from '@/db/repositories/feedback-repository'
import { isForeignKeyViolation } from '@/db/utils/postgres-errors'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import type { InsertFeedbackModel } from '@/domain/entities/feedback'

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
