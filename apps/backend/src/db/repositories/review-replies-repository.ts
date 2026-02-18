import { and, asc, eq, getTableColumns, sql } from 'drizzle-orm'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertReviewReplyModel } from '@/domain/entities/review-reply'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'

const insertReviewReplyImpl = async (params: InsertReviewReplyModel) => {
  return db.insert(schema.reviewReplies).values(params).returning()
}

export const insertReviewReply = withDbTracing(
  'insert-review-reply',
  insertReviewReplyImpl
)

const deleteReviewReplyImpl = async (id: string) => {
  return db
    .delete(schema.reviewReplies)
    .where(and(eq(schema.reviewReplies.id, id)))
    .returning()
}

export const deleteReviewReply = withDbTracing(
  'delete-review-reply',
  deleteReviewReplyImpl
)

const getReviewReplyByIdImpl = async (id: string) => {
  return db
    .select()
    .from(schema.reviewReplies)
    .where(eq(schema.reviewReplies.id, id))
}

export const getReviewReplyById = withDbTracing(
  'get-review-reply-by-id',
  getReviewReplyByIdImpl
)

const updateReviewReplyImpl = async (id: string, reply: string) => {
  return db
    .update(schema.reviewReplies)
    .set({ reply })
    .where(and(eq(schema.reviewReplies.id, id)))
    .returning()
}

export const updateReviewReply = withDbTracing(
  'update-review-reply',
  updateReviewReplyImpl
)

const selectReviewRepliesImpl = async (
  reviewId: string,
  authenticatedUserId?: string
) => {
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

export const selectReviewReplies = withDbTracing(
  'select-review-replies',
  selectReviewRepliesImpl
)
