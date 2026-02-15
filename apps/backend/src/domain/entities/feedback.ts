import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'

export type Feedback = InferSelectModel<typeof schema.feedbacks>
export type InsertFeedbackModel = InferInsertModel<typeof schema.feedbacks>
