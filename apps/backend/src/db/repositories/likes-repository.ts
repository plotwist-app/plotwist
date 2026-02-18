import { eq, getTableColumns, sql } from 'drizzle-orm'
import type { InsertLike } from '@/domain/entities/likes'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { schema } from '../schema'

const insertLikeImpl = async (values: InsertLike) => {
  return db.insert(schema.likes).values(values).returning()
}

export const insertLike = withDbTracing('insert-like', insertLikeImpl)

const deleteLikeImpl = async (id: string) => {
  return db.delete(schema.likes).where(eq(schema.likes.id, id)).returning()
}

export const deleteLike = withDbTracing('delete-like', deleteLikeImpl)

const selectLikesImpl = async (entityId: string) => {
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

export const selectLikes = withDbTracing('select-likes', selectLikesImpl)
