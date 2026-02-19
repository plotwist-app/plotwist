import { eq, getTableColumns, sql } from 'drizzle-orm'
import type { InsertLike } from '@/domain/entities/likes'
import { db } from '..'
import { schema } from '../schema'

export async function insertLike(values: InsertLike) {
  return db.insert(schema.likes).values(values).returning()
}

export async function deleteLike(id: string) {
  return db.delete(schema.likes).where(eq(schema.likes.id, id)).returning()
}

export async function selectLikes(entityId: string) {
  return db
    .select({
      ...getTableColumns(schema.likes),
      user: {
        id: schema.users.id,
        username: schema.users.username,
        avatarUrl: schema.users.avatarUrl,
        subscriptionType: sql`COALESCE(${schema.subscriptions.type}, 'MEMBER')`,
      },
    })
    .from(schema.likes)
    .where(eq(schema.likes.entityId, entityId))
    .leftJoin(schema.users, eq(schema.likes.userId, schema.users.id))
    .leftJoin(
      schema.subscriptions,
      eq(schema.users.id, schema.subscriptions.userId)
    )
}
