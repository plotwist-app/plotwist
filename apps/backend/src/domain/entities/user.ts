import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type User = InferSelectModel<typeof schema.users>
export type InsertUserModel = InferInsertModel<typeof schema.users>
