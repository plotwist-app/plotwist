import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'

export type Follow = InferSelectModel<typeof schema.followers>
export type InsertFollow = InferInsertModel<typeof schema.followers>
