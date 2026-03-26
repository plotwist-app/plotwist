import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type Achievement = InferSelectModel<typeof schema.achievements>
export type InsertAchievementModel = InferInsertModel<
  typeof schema.achievements
>
export type UserAchievement = InferSelectModel<typeof schema.userAchievements>
