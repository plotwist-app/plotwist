import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'

type NonNullableRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

export type UserActivity = InferSelectModel<typeof schema.userActivities>
export type InsertUserActivity = InferInsertModel<typeof schema.userActivities>
export type DeleteUserActivity = NonNullableRequired<
  Pick<
    InsertUserActivity,
    'activityType' | 'entityId' | 'entityType' | 'userId'
  >
>

export type DeleteFollowUserActivity = {
  followerId: string
  followedId: string
  userId: string
}

export type SelectUserActivities = {
  pageSize: number
  cursor?: string
  userIds?: string[]
}
