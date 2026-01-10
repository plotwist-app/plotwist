import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'

export type Like = InferSelectModel<typeof schema.likes>
export type InsertLike = Pick<
  InferInsertModel<typeof schema.likes>,
  'entityId' | 'entityType' | 'userId'
>
