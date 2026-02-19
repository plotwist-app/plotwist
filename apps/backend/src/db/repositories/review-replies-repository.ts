import { and, asc, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertReviewReplyModel } from '@/domain/entities/review-reply'

export async function insertReviewReply(params: InsertReviewReplyModel) {
  return db.insert(schema.reviewReplies).values(params).returning()
}

export async function deleteReviewReply(id: string) {
  return db
    .delete(schema.reviewReplies)
    .where(and(eq(schema.reviewReplies.id, id)))
    .returning()
}

export async function getReviewReplyById(id: string) {
  return db
    .select()
    .from(schema.reviewReplies)
    .where(eq(schema.reviewReplies.id, id))
}

export async function updateReviewReply(id: string, reply: string) {
  return db
    .update(schema.reviewReplies)
    .set({ reply })
    .where(and(eq(schema.reviewReplies.id, id)))
    .returning()
}

export async function selectReviewReplies(
  reviewId: string,
  authenticatedUserId?: string
) {
  return db
    .select({
      ...getTableColumns(schema.reviewReplies),
      user: {
        id: schema.users.id,
        username: schema.users.username,
        avatarUrl: schema.users.avatarUrl,
      },
      likeCount:
        sql`(SELECT COUNT(*)::int FROM ${schema.likes} WHERE ${schema.likes.entityId} = ${schema.reviewReplies.id})`.as(
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
             WHERE ${schema.likes.entityId} = ${schema.reviewReplies.id}
             AND ${schema.likes.userId} = ${authenticatedUserId}
             LIMIT 1
           )`.as('userLike')
        : sql`null`.as('userLike'),
    })
    .from(schema.reviewReplies)
    .where(eq(schema.reviewReplies.reviewId, reviewId))
    .leftJoin(schema.users, eq(schema.reviewReplies.userId, schema.users.id))
    .orderBy(asc(schema.reviewReplies.createdAt))
}
