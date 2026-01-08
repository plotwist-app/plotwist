import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type ReviewReply = InferSelectModel<typeof schema.reviewReplies>
export type InsertReviewReplyModel = InferInsertModel<
  typeof schema.reviewReplies
>
