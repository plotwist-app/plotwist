import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  lte,
  type SQL,
  sql,
} from 'drizzle-orm'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertReviewModel } from '@/domain/entities/review'
import type { GetReviewInput } from '@/domain/services/reviews/get-review'
import type { GetReviewsServiceInput } from '@/domain/services/reviews/get-reviews'
import type { UpdateReviewInput } from '@/domain/services/reviews/update-review'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'

const insertReviewImpl = async (params: InsertReviewModel) => {
  return db.insert(schema.reviews).values(params).returning()
}

export const insertReview = withDbTracing('insert-review', insertReviewImpl)

function buildSeasonEpisodeFilter(
  seasonNumber?: number,
  episodeNumber?: number
) {
  if (!seasonNumber) {
    return and(
      sql`${schema.reviews.seasonNumber} IS NULL`,
      sql`${schema.reviews.episodeNumber} IS NULL`
    )
  }

  if (!episodeNumber) {
    return and(
      eq(schema.reviews.seasonNumber, seasonNumber),
      sql`${schema.reviews.episodeNumber} IS NULL`
    )
  }

  return and(
    eq(schema.reviews.seasonNumber, seasonNumber),
    eq(schema.reviews.episodeNumber, episodeNumber)
  )
}

const selectReviewsImpl = async ({
  mediaType,
  tmdbId,
  userId,
  authenticatedUserId,
  limit = 50,
  page = 1,
  orderBy,
  startDate,
  endDate,
  seasonNumber,
  episodeNumber,
}: GetReviewsServiceInput) => {
  const orderCriteria = [
    orderBy === 'likeCount'
      ? desc(
          sql`(
            SELECT COUNT(*) 
            FROM ${schema.likes} 
            WHERE ${schema.likes.entityId} = ${schema.reviews.id}
          )`
        )
      : undefined,
    desc(schema.reviews.createdAt),
  ].filter(Boolean) as SQL<unknown>[]

  const offset = (page - 1) * limit

  return db
    .select({
      ...getTableColumns(schema.reviews),
      user: {
        id: schema.users.id,
        username: schema.users.username,
        avatarUrl: schema.users.avatarUrl,
      },
      likeCount:
        sql`(SELECT COUNT(*)::int FROM ${schema.likes} WHERE ${schema.likes.entityId} = ${schema.reviews.id})`.as(
          'likeCount'
        ),
      replyCount:
        sql`(SELECT COUNT(*)::int FROM ${schema.reviewReplies} WHERE ${schema.reviewReplies.reviewId} = ${schema.reviews.id})`.as(
          'replyCount'
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
               WHERE ${schema.likes.entityId} = ${schema.reviews.id}
               AND ${schema.likes.userId} = ${authenticatedUserId}
               LIMIT 1
             )`.as('userLike')
        : sql`null`.as('userLike'),
    })
    .from(schema.reviews)
    .where(
      and(
        tmdbId ? eq(schema.reviews.tmdbId, tmdbId) : undefined,
        mediaType ? eq(schema.reviews.mediaType, mediaType) : undefined,
        userId ? eq(schema.reviews.userId, userId) : undefined,
        startDate ? gte(schema.reviews.createdAt, startDate) : undefined,
        endDate ? lte(schema.reviews.createdAt, endDate) : undefined,
        tmdbId
          ? buildSeasonEpisodeFilter(seasonNumber, episodeNumber)
          : undefined
      )
    )
    .leftJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
    .orderBy(...orderCriteria)
    .limit(limit + 1) // Fetch one extra to check if there are more
    .offset(offset)
}

export const selectReviews = withDbTracing(
  'select-reviews',
  selectReviewsImpl
)

const deleteReviewImpl = async (id: string) => {
  return db.delete(schema.reviews).where(eq(schema.reviews.id, id)).returning()
}

export const deleteReview = withDbTracing('delete-review', deleteReviewImpl)

const updateReviewImpl = async ({
  id,
  rating,
  review,
  hasSpoilers,
}: UpdateReviewInput) => {
  return db
    .update(schema.reviews)
    .set({ rating, review, hasSpoilers })
    .where(eq(schema.reviews.id, id))
    .returning()
}

export const updateReview = withDbTracing('update-review', updateReviewImpl)

const getReviewByIdImpl = async (id: string) => {
  return db.select().from(schema.reviews).where(eq(schema.reviews.id, id))
}

export const getReviewById = withDbTracing(
  'get-review-by-id',
  getReviewByIdImpl
)

const selectReviewsCountImpl = async (userId?: string) => {
  return db
    .select({ count: count() })
    .from(schema.reviews)
    .where(userId ? eq(schema.reviews.userId, userId) : undefined)
}

export const selectReviewsCount = withDbTracing(
  'select-reviews-count',
  selectReviewsCountImpl
)

const selectBestReviewsImpl = async (userId: string, limit = 10) => {
  return db
    .select()
    .from(schema.reviews)
    .where(
      and(
        eq(schema.reviews.userId, userId),
        eq(schema.reviews.rating, 5),
        sql`${schema.reviews.seasonNumber} IS NULL`,
        sql`${schema.reviews.episodeNumber} IS NULL`
      )
    )
    .orderBy(desc(schema.reviews.rating), desc(schema.reviews.createdAt))
    .limit(limit)
}

export const selectBestReviews = withDbTracing(
  'select-best-reviews',
  selectBestReviewsImpl
)

const selectReviewImpl = async ({
  mediaType,
  tmdbId,
  userId,
  seasonNumber,
  episodeNumber,
}: GetReviewInput) => {
  return db
    .select()
    .from(schema.reviews)
    .where(
      and(
        eq(schema.reviews.mediaType, mediaType),
        eq(schema.reviews.tmdbId, tmdbId),
        eq(schema.reviews.userId, userId),
        tmdbId
          ? buildSeasonEpisodeFilter(seasonNumber, episodeNumber)
          : undefined
      )
    )
}

export const selectReview = withDbTracing('select-review', selectReviewImpl)
