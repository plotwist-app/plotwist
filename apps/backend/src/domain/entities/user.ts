import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type User = InferSelectModel<typeof schema.users>
export type InsertUserModel = InferInsertModel<typeof schema.users>
