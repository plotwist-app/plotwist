import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type Review = InferSelectModel<typeof schema.reviews>
export type InsertReviewModel = InferInsertModel<typeof schema.reviews>
