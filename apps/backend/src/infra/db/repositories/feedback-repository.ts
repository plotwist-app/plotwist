import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertFeedbackModel } from '@/domain/entities/feedback'

export async function insertFeedback(params: InsertFeedbackModel) {
  return db.insert(schema.feedbacks).values(params).returning()
}
