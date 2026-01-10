import { and, desc, eq, getTableColumns, inArray, lte, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import type {
  DeleteFollowUserActivity,
  DeleteUserActivity,
  InsertUserActivity,
  SelectUserActivities,
} from '@/domain/entities/user-activity'
import { db } from '..'
import { schema } from '../schema'

export async function insertUserActivity(values: InsertUserActivity) {
  return db.insert(schema.userActivities).values(values)
}

export async function selectUserActivities({
  userIds,
  pageSize,
  cursor,
}: SelectUserActivities) {
  const additionalInfoCase = buildAdditionalInfoCase()

  const owner = alias(schema.users, 'owner')

  return db
    .select({
      ...getTableColumns(schema.userActivities),
      additionalInfo: additionalInfoCase,
      owner: {
        id: owner.id,
        username: owner.username,
        avatarUrl: owner.avatarUrl,
      },
    })
    .from(schema.userActivities)
    .where(buildWhereClause(userIds, cursor))
    .orderBy(desc(schema.userActivities.createdAt))
    .limit(pageSize + 1)
    .leftJoin(schema.users, buildUsersJoinCondition())
    .leftJoin(schema.lists, buildListsJoinCondition())
    .leftJoin(schema.reviews, buildReviewsJoinCondition())
    .leftJoin(schema.reviewReplies, buildRepliesJoinCondition())
    .leftJoin(owner, eq(schema.userActivities.userId, owner.id))
}

function buildAdditionalInfoCase() {
  return sql`
    CASE
      WHEN ${schema.userActivities.activityType} IN ('FOLLOW_USER') THEN 
        ${buildUserInfo()}
      WHEN ${schema.userActivities.activityType} IN ('CREATE_LIST', 'LIKE_LIST') THEN 
        ${buildListInfo()}
      WHEN ${schema.userActivities.activityType} IN ('LIKE_REVIEW', 'CREATE_REVIEW') THEN 
        ${buildReviewInfo()}
      WHEN ${schema.userActivities.activityType} IN ('LIKE_REPLY', 'CREATE_REPLY') THEN 
        ${buildReplyInfo()}
      WHEN ${schema.userActivities.activityType} IN ('ADD_ITEM', 'DELETE_ITEM') THEN 
        ${buildItemInfo()}
      WHEN ${schema.userActivities.activityType} IN ('WATCH_EPISODE') THEN 
        json_build_object('episodes', metadata)
      WHEN ${schema.userActivities.activityType} IN ('CHANGE_STATUS') THEN 
        ${buildStatusInfo()}
      ELSE NULL
    END
  `
}

function buildUserInfo() {
  return sql`json_build_object(
    'id', ${schema.users.id},
    'username', ${schema.users.username},
    'avatarUrl', ${schema.users.avatarUrl}
  )`
}

function buildListInfo() {
  return sql`json_build_object(
    'id', ${schema.lists.id},
    'title', ${schema.lists.title}
  )`
}

function buildReviewInfo() {
  return sql`json_build_object(
    'id', ${schema.reviews.id},
    'review', ${schema.reviews.review},
    'rating', ${schema.reviews.rating},
    'tmdbId', ${schema.reviews.tmdbId},
    'mediaType', ${schema.reviews.mediaType},
    'seasonNumber', ${schema.reviews.seasonNumber},
    'episodeNumber', ${schema.reviews.episodeNumber},
    'author', (
      SELECT ${buildUserInfo()}
      FROM ${schema.users}
      WHERE ${schema.users.id} = ${schema.reviews.userId}
    )
  )`
}

function buildReplyInfo() {
  return sql`json_build_object(
    'id', ${schema.reviewReplies.id},
    'reply', ${schema.reviewReplies.reply},
    'review', (
      SELECT json_build_object(
        'id', ${schema.reviews.id},
        'review', ${schema.reviews.review},
        'rating', ${schema.reviews.rating},
        'tmdbId', ${schema.reviews.tmdbId},
        'mediaType', ${schema.reviews.mediaType},
        'seasonNumber', ${schema.reviews.seasonNumber},
        'episodeNumber', ${schema.reviews.episodeNumber},
        'author', ${buildUserInfo()}
      )
      FROM ${schema.reviews}
      LEFT JOIN ${schema.users} ON ${schema.users.id} = ${schema.reviews.userId}
      WHERE ${schema.reviews.id} = ${schema.reviewReplies.reviewId}
    )
  )`
}

function buildItemInfo() {
  return sql`json_build_object(
    'tmdbId', ${sql`(metadata::jsonb->>'tmdbId')::integer`},
    'mediaType', ${sql`(metadata::jsonb->>'mediaType')`},
    'listId', ${schema.lists.id},
    'listTitle', ${schema.lists.title}
  )`
}

function buildStatusInfo() {
  return sql`json_build_object(
    'tmdbId', ${sql`(metadata::jsonb->>'tmdbId')::integer`},
    'mediaType', ${sql`(metadata::jsonb->>'mediaType')`},
    'status', ${sql`(metadata::jsonb->>'status')`}
  )`
}

function buildWhereClause(
  userIds: string[] | undefined,
  cursor: string | undefined
) {
  return and(
    userIds ? inArray(schema.userActivities.userId, userIds) : undefined,
    cursor
      ? lte(
          sql`DATE_TRUNC('milliseconds', ${schema.userActivities.createdAt})`,
          cursor
        )
      : undefined
  )
}

function buildUsersJoinCondition() {
  return sql`(${schema.userActivities.activityType} = 'FOLLOW_USER' OR ${schema.userActivities.activityType} = 'UNFOLLOW_USER') 
    AND ${sql`(metadata::jsonb->>'followedId')`} = ${schema.users.id}::text`
}

function buildListsJoinCondition() {
  return sql`(
    ${schema.userActivities.activityType} = 'CREATE_LIST' 
    OR ${schema.userActivities.activityType} = 'LIKE_LIST'
    OR ${schema.userActivities.activityType} = 'ADD_ITEM'
    OR ${schema.userActivities.activityType} = 'DELETE_ITEM')
    AND ${schema.userActivities.entityId} = ${schema.lists.id}`
}

function buildReviewsJoinCondition() {
  return sql`(
    ${schema.userActivities.activityType} = 'LIKE_REVIEW'
    OR ${schema.userActivities.activityType} = 'CREATE_REVIEW')
    AND ${schema.userActivities.entityId} = ${schema.reviews.id}`
}

function buildRepliesJoinCondition() {
  return sql`(
    ${schema.userActivities.activityType} = 'LIKE_REPLY'
    OR ${schema.userActivities.activityType} = 'CREATE_REPLY')
    AND ${schema.userActivities.entityId} = ${schema.reviewReplies.id}`
}

export async function deleteUserActivity({
  activityType,
  entityId,
  entityType,
  userId,
}: DeleteUserActivity) {
  return db
    .delete(schema.userActivities)
    .where(
      and(
        eq(schema.userActivities.activityType, activityType),
        eq(schema.userActivities.entityId, entityId),
        eq(schema.userActivities.entityType, entityType),
        eq(schema.userActivities.userId, userId)
      )
    )
}

export async function deleteFollowUserActivity({
  followedId,
  followerId,
  userId,
}: DeleteFollowUserActivity) {
  return db
    .delete(schema.userActivities)
    .where(
      and(
        eq(schema.userActivities.activityType, 'FOLLOW_USER'),
        eq(schema.userActivities.userId, userId),
        sql`(${schema.userActivities.metadata} ->> 'followerId')::text = ${followerId}::text`,
        sql`(${schema.userActivities.metadata} ->> 'followedId')::text = ${followedId}::text`
      )
    )
}

export async function deleteUserActivityById(activityId: string) {
  return db
    .delete(schema.userActivities)
    .where(eq(schema.userActivities.id, activityId))
}
