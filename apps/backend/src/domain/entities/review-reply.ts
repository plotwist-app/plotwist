import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type ReviewReply = InferSelectModel<typeof schema.reviewReplies>
export type InsertReviewReplyModel = InferInsertModel<
  typeof schema.reviewReplies
>
