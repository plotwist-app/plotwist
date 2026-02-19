import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type Review = InferSelectModel<typeof schema.reviews>
export type InsertReviewModel = InferInsertModel<typeof schema.reviews>
