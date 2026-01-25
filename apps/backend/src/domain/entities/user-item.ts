import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { UserItemStatus } from '@/@types/item-status-enum'
import type { schema } from '@/db/schema'

export type UserItem = InferSelectModel<typeof schema.userItems>
export type InsertUserItem = Pick<
  InferInsertModel<typeof schema.userItems>,
  'tmdbId' | 'userId' | 'mediaType' | 'status'
>

export type SelectUserItems = {
  userId: string
  status?: UserItemStatus
  rating: number[]
  mediaType: Array<'TV_SHOW' | 'MOVIE'>
  cursor?: string
  pageSize: number
  orderBy: 'addedAt' | 'updatedAt' | 'rating'
  orderDirection: 'asc' | 'desc'
  onlyItemsWithoutReview?: boolean
}

export type SelectAllUserItems = {
  status?: UserItemStatus | 'ALL'
  userId: string
}
