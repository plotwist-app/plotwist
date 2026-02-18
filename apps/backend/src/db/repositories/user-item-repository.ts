import {
  and,
  asc,
  between,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNull,
  lte,
  sql,
} from 'drizzle-orm'
import type { UserItemStatus } from '@/@types/item-status-enum'
import type {
  InsertUserItem,
  SelectAllUserItems,
  SelectUserItems,
} from '@/domain/entities/user-item'
import type { GetUserItemInput } from '@/domain/services/user-items/get-user-item'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { schema } from '../schema'

const upsertUserItemImpl = async ({
  mediaType,
  tmdbId,
  userId,
  status,
}: InsertUserItem) => {
  return db.execute(
    sql`
        INSERT INTO ${schema.userItems} (media_type, tmdb_id, user_id, status)
        VALUES (${mediaType}, ${tmdbId}, ${userId}, ${status})
        ON CONFLICT (media_type, tmdb_id, user_id)
        DO UPDATE SET 
          status = ${status},
          updated_at = NOW() 
        RETURNING *
      `
  )
}

export const upsertUserItem = withDbTracing('upsert-user-item', upsertUserItemImpl)

const selectUserItemsImpl = async ({
  userId,
  status,
  pageSize,
  cursor,
  orderBy,
  orderDirection,
  mediaType,
  rating,
  onlyItemsWithoutReview,
}: SelectUserItems) => {
  const whereConditions = [
    eq(schema.userItems.userId, userId),
    inArray(schema.userItems.mediaType, mediaType),
  ]

  if (status) {
    whereConditions.push(eq(schema.userItems.status, status))
  }

  if (cursor) {
    whereConditions.push(
      lte(
        sql`DATE_TRUNC('milliseconds', ${schema.userItems.updatedAt})`,
        cursor
      )
    )
  }

  if (rating[0] !== 0 || rating[1] !== 5) {
    whereConditions.push(between(schema.reviews.rating, rating[0], rating[1]))
  }

  if (onlyItemsWithoutReview) {
    whereConditions.push(isNull(schema.reviews.rating))
  }

  const query = db
    .select({
      id: schema.userItems.id,
      userId: schema.userItems.userId,
      tmdbId: schema.userItems.tmdbId,
      mediaType: schema.userItems.mediaType,
      status: schema.userItems.status,
      position: schema.userItems.position,
      updatedAt: schema.userItems.updatedAt,
      addedAt: schema.userItems.addedAt,
      rating: schema.reviews.rating,
    })
    .from(schema.userItems)
    .leftJoin(
      schema.reviews,
      and(
        eq(schema.reviews.tmdbId, schema.userItems.tmdbId),
        eq(schema.reviews.userId, schema.userItems.userId),
        eq(schema.reviews.mediaType, schema.userItems.mediaType),
        isNull(schema.reviews.seasonNumber),
        isNull(schema.reviews.episodeNumber)
      )
    )

  const orderColumn = getOrderColumn(orderBy)

  return query
    .where(and(...whereConditions))
    .orderBy(
      (orderColumn &&
        (orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn))) ||
        desc(schema.userItems.updatedAt)
    )
    .limit(pageSize + 1)
}

export const selectUserItems = withDbTracing(
  'select-user-items',
  selectUserItemsImpl
)

const deleteUserItemImpl = async (id: string) => {
  return db
    .delete(schema.userItems)
    .where(eq(schema.userItems.id, id))
    .returning()
}

export const deleteUserItem = withDbTracing(
  'delete-user-item',
  deleteUserItemImpl
)

const selectUserItemImpl = async ({
  userId,
  mediaType,
  tmdbId,
}: GetUserItemInput) => {
  return db
    .select()
    .from(schema.userItems)
    .where(
      and(
        eq(schema.userItems.userId, userId),
        eq(schema.userItems.mediaType, mediaType),
        eq(schema.userItems.tmdbId, tmdbId)
      )
    )
    .limit(1)
}

export const selectUserItem = withDbTracing(
  'select-user-item',
  selectUserItemImpl
)

const selectUserItemStatusImpl = async (userId: string) => {
  return db
    .select({
      status: schema.userItems.status,
      count: sql`COUNT(*)::int`,
      percentage: sql`(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ())::float`,
    })
    .from(schema.userItems)
    .where(eq(schema.userItems.userId, userId))
    .groupBy(schema.userItems.status)
}

export const selectUserItemStatus = withDbTracing(
  'select-user-item-status',
  selectUserItemStatusImpl
)

const selectAllUserItemsByStatusImpl = async ({
  status,
  userId,
}: SelectAllUserItems) => {
  const { id, tmdbId, mediaType, position, updatedAt } = getTableColumns(schema.userItems)

  const whereConditions = [eq(schema.userItems.userId, userId)]

  if (status !== 'ALL') {
    whereConditions.push(eq(schema.userItems.status, status as UserItemStatus))
  }
  return db
    .select({
      id,
      tmdbId,
      mediaType,
      position,
      updatedAt,
    })
    .from(schema.userItems)
    .where(and(...whereConditions))
    .orderBy(asc(schema.userItems.position), desc(schema.userItems.updatedAt))
}

export const selectAllUserItemsByStatus = withDbTracing(
  'select-all-user-items-by-status',
  selectAllUserItemsByStatusImpl
)

const reorderUserItemsImpl = async (
  userId: string,
  _status: string,
  orderedIds: string[]
) => {
  // Update position for each item based on array order
  const updates = orderedIds.map((id, index) =>
    db
      .update(schema.userItems)
      .set({ position: index })
      .where(
        and(eq(schema.userItems.id, id), eq(schema.userItems.userId, userId))
      )
  )

  await Promise.all(updates)
}

export const reorderUserItems = withDbTracing(
  'reorder-user-items',
  reorderUserItemsImpl
)

const selectAllUserItemsImpl = async (userId: string) => {
  return db
    .select({
      id: schema.userItems.id,
      tmdbId: schema.userItems.tmdbId,
      mediaType: schema.userItems.mediaType,
    })
    .from(schema.userItems)
    .where(eq(schema.userItems.userId, userId))
}

export const selectAllUserItems = withDbTracing(
  'select-all-user-items',
  selectAllUserItemsImpl
)

const selectUserItemsCountImpl = async (userId: string) => {
  const result = await db
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(schema.userItems)
    .where(eq(schema.userItems.userId, userId))

  return result[0]?.count ?? 0
}

export const selectUserItemsCount = withDbTracing(
  'select-user-items-count',
  selectUserItemsCountImpl
)

function getOrderColumn(orderBy: string) {
  switch (orderBy) {
    case 'updatedAt':
      return schema.userItems.updatedAt
    case 'addedAt':
      return schema.userItems.addedAt
    case 'rating':
      return schema.reviews.rating
  }
}
