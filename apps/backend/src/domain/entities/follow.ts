import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type Follow = InferSelectModel<typeof schema.followers>
export type InsertFollow = InferInsertModel<typeof schema.followers>
