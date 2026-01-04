import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type ListItem = InferSelectModel<typeof schema.listItems>
export type InsertListItem = InferInsertModel<typeof schema.listItems>
