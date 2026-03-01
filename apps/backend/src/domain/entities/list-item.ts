import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type ListItem = InferSelectModel<typeof schema.listItems>
export type InsertListItem = InferInsertModel<typeof schema.listItems>
