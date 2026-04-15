import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type SocialLink = InferSelectModel<typeof schema.socialLinks>
export type InsertSocialLink = InferInsertModel<typeof schema.socialLinks>
