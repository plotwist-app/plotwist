import type { InsertFeedbackModel } from '@/domain/entities/feedback'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'

export async function insertFeedback(params: InsertFeedbackModel) {
  return db.insert(schema.feedbacks).values(params).returning()
}
