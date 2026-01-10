import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type List = InferSelectModel<typeof schema.lists>
export type InsertListModel = InferInsertModel<typeof schema.lists>
