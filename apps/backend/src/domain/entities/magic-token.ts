import type { InferInsertModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'

export type InsertMagicTokenModel = InferInsertModel<typeof schema.magicTokens>
