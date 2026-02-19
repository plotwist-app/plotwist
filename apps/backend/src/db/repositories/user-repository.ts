import { and, desc, eq, isNull, like, sql } from 'drizzle-orm'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertUserModel } from '@/domain/entities/user'
import type { UpdateUserInput } from '@/domain/services/users/update-user'
export async function getUserByEmail(email: string) {
  return db
    .select()
    .from(schema.users)
    .where(
      and(
        sql`LOWER(${schema.users.email}) = LOWER(${email})`,
        isNull(schema.users.deletedAt)
      )
    )
}

export async function getUserById(id: string) {
  return db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      username: schema.users.username,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl,
      biography: schema.users.biography,
      isLegacy: schema.users.isLegacy,
      subscriptionType: sql`COALESCE(${schema.subscriptions.type}, 'MEMBER')`,
      createdAt: schema.users.createdAt,
      bannerUrl: schema.users.bannerUrl,
    })
    .from(schema.users)
    .leftJoin(
      schema.subscriptions,
      eq(schema.users.id, schema.subscriptions.userId)
    )
    .where(and(eq(schema.users.id, id), isNull(schema.users.deletedAt)))
}

export async function getUserByUsername(username: string) {
  return db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      username: schema.users.username,
      displayName: schema.users.displayName,
      avatarUrl: schema.users.avatarUrl,
      biography: schema.users.biography,
      isLegacy: schema.users.isLegacy,
      subscriptionType: sql`COALESCE(${schema.subscriptions.type}, 'MEMBER')`,
      createdAt: schema.users.createdAt,
      bannerUrl: schema.users.bannerUrl,
    })
    .from(schema.users)
    .where(
      and(
        sql`LOWER(${schema.users.username}) = LOWER(${username})`,
        isNull(schema.users.deletedAt)
      )
    )
    .leftJoin(
      schema.subscriptions,
      eq(schema.users.id, schema.subscriptions.userId)
    )
}

export async function insertUser({
  email,
  password,
  username,
  displayName,
}: InsertUserModel) {
  return db
    .insert(schema.users)
    .values({
      username,
      email,
      password,
      displayName,
    })
    .returning()
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  return db
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.id, userId))
    .returning()
}

export async function updateUserPassword(userId: string, password: string) {
  return db
    .update(schema.users)
    .set({
      password: password,
      isLegacy: false,
    })
    .where(eq(schema.users.id, userId))
}

export async function getProUsersDetails() {
  return db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      preferences: schema.userPreferences,
      items: sql`COALESCE(
        json_agg(
          json_build_object(
            'id', ${schema.userItems.id},
            'tmdbId', ${schema.userItems.tmdbId},
            'mediaType', ${schema.userItems.mediaType}
          )
        ) FILTER (WHERE ${schema.userItems.id} IS NOT NULL),
        '[]'::json
      )`,
    })
    .from(schema.users)
    .where(
      and(eq(schema.subscriptions.type, 'PRO'), isNull(schema.users.deletedAt))
    )
    .leftJoin(
      schema.userPreferences,
      eq(schema.users.id, schema.userPreferences.userId)
    )
    .leftJoin(
      schema.subscriptions,
      eq(schema.users.id, schema.subscriptions.userId)
    )
    .leftJoin(schema.userItems, eq(schema.users.id, schema.userItems.userId))
    .groupBy(schema.users.id, schema.userPreferences.id)
}

export async function deleteUser(userId: string) {
  const anonymizedEmail = `deleted-${userId}@deleted.local`
  const anonymizedUsername = `deleted_${userId.replace(/-/g, '')}`

  return db
    .update(schema.users)
    .set({
      deletedAt: sql`NOW()`,
      email: anonymizedEmail,
      username: anonymizedUsername,
      displayName: null,
      avatarUrl: null,
      bannerUrl: null,
      biography: null,
      password: 'DELETED',
    })
    .where(eq(schema.users.id, userId))
    .returning()
}

export async function listUsersByUsernameLike(username: string) {
  return db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      avatarUrl: schema.users.avatarUrl,
      isFollowed: sql<boolean>`EXISTS (
        SELECT 1 FROM ${schema.followers}
        WHERE ${schema.followers.followedId} = ${schema.users.id}
      )`,
    })
    .from(schema.users)
    .where(
      and(
        like(schema.users.username, `%${username}%`),
        isNull(schema.users.deletedAt)
      )
    )
    .orderBy(
      desc(
        sql`CASE WHEN EXISTS (
          SELECT 1 FROM ${schema.followers}
          WHERE ${schema.followers.followedId} = ${schema.users.id}
        ) THEN 1 ELSE 0 END`
      )
    )
    .limit(10)
}
