import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type List = InferSelectModel<typeof schema.lists>
export type InsertListModel = InferInsertModel<typeof schema.lists>
