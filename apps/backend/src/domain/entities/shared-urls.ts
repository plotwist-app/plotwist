import type { InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type SharedUrl = InferSelectModel<typeof schema.sharedUrls>
