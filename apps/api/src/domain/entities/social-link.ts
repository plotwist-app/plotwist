import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type SocialLink = InferSelectModel<typeof schema.socialLinks>
export type InsertSocialLink = InferInsertModel<typeof schema.socialLinks>
