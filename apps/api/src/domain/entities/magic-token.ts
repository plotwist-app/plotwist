import type { schema } from '@/db/schema'
import type { InferInsertModel } from 'drizzle-orm'

export type InsertMagicTokenModel = InferInsertModel<typeof schema.magicTokens>
