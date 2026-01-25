import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'

export type SocialLink = InferSelectModel<typeof schema.socialLinks>
export type InsertSocialLink = InferInsertModel<typeof schema.socialLinks>
