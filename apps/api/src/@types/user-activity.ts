import type { InsertLike } from '@/domain/entities/likes'
import type { InsertUserActivity } from '@/domain/entities/user-activity'

export const likeAcvityType: Record<
  InsertLike['entityType'],
  InsertUserActivity['activityType']
> = {
  LIST: 'LIKE_LIST',
  REPLY: 'LIKE_REPLY',
  REVIEW: 'LIKE_REVIEW',
}

export type UserActivityType =
  | 'CREATE_LIST'
  | 'ADD_ITEM'
  | 'DELETE_ITEM'
  | 'LIKE_REVIEW'
  | 'LIKE_REPLY'
  | 'LIKE_LIST'
  | 'CREATE_REVIEW'
  | 'CREATE_REPLY'
  | 'FOLLOW_USER'
  | 'WATCH_EPISODE'
  | 'CHANGE_STATUS'
  | 'CREATE_ACCOUNT'

export type UserActivityEntityType = 'REVIEW' | 'REPLY' | 'LIST'
