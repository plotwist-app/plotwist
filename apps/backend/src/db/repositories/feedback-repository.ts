import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertFeedbackModel } from '@/domain/entities/feedback'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'

const insertFeedbackImpl = async (params: InsertFeedbackModel) => {
  return db.insert(schema.feedbacks).values(params).returning()
}

export const insertFeedback = withDbTracing('insert-feedback', insertFeedbackImpl)
