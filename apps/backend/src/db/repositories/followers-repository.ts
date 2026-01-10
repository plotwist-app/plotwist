import { and, desc, eq, getTableColumns, lte, sql } from 'drizzle-orm'
import type { CreateFollowServiceInput } from '@/domain/services/follows/create-follow'
import type { DeleteFollowServiceInput } from '@/domain/services/follows/delete-follow'
import type { GetFollowServiceInput } from '@/domain/services/follows/get-follow'
import type { GetFollowersInput } from '@/domain/services/follows/get-followers'
import { db } from '..'
import { schema } from '../schema'

export async function insertFollow({
  followedId,
  followerId,
}: CreateFollowServiceInput) {
  return db
    .insert(schema.followers)
    .values({
      followedId,
      followerId,
    })
    .returning()
}

export async function getFollow({
  followedId,
  followerId,
}: GetFollowServiceInput) {
  return db
    .select()
    .from(schema.followers)
    .where(
      and(
        eq(schema.followers.followedId, followedId),
        eq(schema.followers.followerId, followerId)
      )
    )
}

export async function deleteFollow({
  followedId,
  followerId,
}: DeleteFollowServiceInput) {
  return db
    .delete(schema.followers)
    .where(
      and(
        eq(schema.followers.followedId, followedId),
        eq(schema.followers.followerId, followerId)
      )
    )
    .returning()
}

export async function selectFollowers({
  followedId,
  followerId,
  cursor,
  pageSize,
}: GetFollowersInput) {
  return db
    .select({
      ...getTableColumns(schema.followers),
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      subscriptionType: sql`COALESCE(${schema.subscriptions.type}, 'MEMBER')`,
    })
    .from(schema.followers)
    .orderBy(desc(schema.followers.createdAt))
    .where(
      and(
        cursor
          ? lte(
              sql`DATE_TRUNC('milliseconds', ${schema.followers.createdAt})`,
              cursor
            )
          : undefined,
        followedId ? eq(schema.followers.followedId, followedId) : undefined,
        followerId ? eq(schema.followers.followerId, followerId) : undefined
      )
    )
    .leftJoin(
      schema.users,
      eq(
        followedId ? schema.followers.followerId : schema.followers.followedId,
        schema.users.id
      )
    )
    .leftJoin(
      schema.subscriptions,
      eq(schema.users.id, schema.subscriptions.userId)
    )
    .limit(pageSize + 1)
}
