import { and, desc, eq, getTableColumns, isNotNull, sql } from 'drizzle-orm'
import type { InsertListModel } from '@/domain/entities/lists'
import type { GetListsInput } from '@/domain/services/lists/get-lists'
import type { UpdateListValues } from '@/domain/services/lists/update-list'
import type { UpdateListBannerInput } from '@/domain/services/lists/update-list-banner'
import { db } from '..'
import { schema } from '../schema'

export function selectLists({
  userId,
  limit = 5,
  authenticatedUserId,
  visibility,
  hasBanner,
}: GetListsInput) {
  return db
    .select({
      ...getTableColumns(schema.lists),
      user: {
        id: schema.users.id,
        username: schema.users.username,
        avatarUrl: schema.users.avatarUrl,
      },

      likeCount:
        sql`(SELECT COUNT(*)::int FROM ${schema.likes} WHERE ${schema.likes.entityId} = ${schema.lists.id})`.as(
          'likeCount'
        ),

      hasLiked: authenticatedUserId
        ? sql`EXISTS (
              SELECT 1 FROM ${schema.likes}
              WHERE ${schema.likes.entityId} = ${schema.lists.id}
              AND ${schema.likes.userId} = ${authenticatedUserId}
            )`.as('hasLiked')
        : sql`false`.as('hasLiked'),

      items: sql`COALESCE(ARRAY(
        SELECT jsonb_build_object(
            'id', ${schema.listItems.id},
            'tmdbId', ${schema.listItems.tmdbId},
            'mediaType', ${schema.listItems.mediaType}
        ) FROM ${schema.listItems}
        WHERE ${schema.listItems.listId} = ${schema.lists.id}
    ), NULL)`.as('items'),
    })
    .from(schema.lists)
    .where(
      and(
        userId ? eq(schema.lists.userId, userId) : undefined,
        visibility ? eq(schema.lists.visibility, visibility) : undefined,
        hasBanner ? isNotNull(schema.lists.bannerUrl) : undefined
      )
    )
    .leftJoin(schema.users, eq(schema.lists.userId, schema.users.id))
    .leftJoin(schema.listItems, eq(schema.listItems.listId, schema.lists.id))
    .groupBy(schema.lists.id, schema.users.id)
    .orderBy(desc(schema.lists.createdAt))
    .limit(limit)
}

export async function insertList(input: InsertListModel) {
  return db
    .insert(schema.lists)
    .values({ ...input })
    .returning()
}

export async function deleteList(id: string) {
  return db.delete(schema.lists).where(eq(schema.lists.id, id)).returning()
}

export async function updateList(
  id: string,
  userId: string,
  values: UpdateListValues
) {
  return db
    .update(schema.lists)
    .set(values)
    .where(and(eq(schema.lists.id, id), eq(schema.lists.userId, userId)))
    .returning()
}

export async function getListById(id: string, authenticatedUserId?: string) {
  return db
    .select({
      ...getTableColumns(schema.lists),
      likeCount:
        sql`(SELECT COUNT(*)::int FROM ${schema.likes} WHERE ${schema.likes.entityId} = ${id})`.as(
          'likeCount'
        ),
      userLike: authenticatedUserId
        ? sql`(
               SELECT json_build_object(
                 'id', ${schema.likes.id},
                 'entityId', ${schema.likes.entityId},
                 'userId', ${schema.likes.userId},
                 'createdAt', ${schema.likes.createdAt}
               )
               FROM ${schema.likes}
               WHERE ${schema.likes.entityId} = ${id}
               AND ${schema.likes.userId} = ${authenticatedUserId}
               LIMIT 1
             )`.as('userLike')
        : sql`null`.as('userLike'),
    })
    .from(schema.lists)
    .where(eq(schema.lists.id, id))
}

export async function updateListBanner({
  listId,
  userId,
  bannerUrl,
}: UpdateListBannerInput) {
  return db
    .update(schema.lists)
    .set({ bannerUrl })
    .where(and(eq(schema.lists.id, listId), eq(schema.lists.userId, userId)))
    .returning()
}
