import type { InferInsertModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type InsertMagicTokenModel = InferInsertModel<typeof schema.magicTokens>
