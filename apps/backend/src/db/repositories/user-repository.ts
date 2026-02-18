import { desc, eq, like, sql } from 'drizzle-orm'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertUserModel } from '@/domain/entities/user'
import type { UpdateUserInput } from '@/domain/services/users/update-user'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'

const getUserByEmailImpl = async (email: string) => {
  return db
    .select()
    .from(schema.users)
    .where(sql`LOWER(${schema.users.email}) = LOWER(${email})`)
}

export const getUserByEmail = withDbTracing(
  'get-user-by-email',
  getUserByEmailImpl
)

const getUserByIdImpl = async (id: string) => {
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
    .where(eq(schema.users.id, id))
}

export const getUserById = withDbTracing('get-user-by-id', getUserByIdImpl)

const getUserByUsernameImpl = async (username: string) => {
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
    .where(sql`LOWER(${schema.users.username}) = LOWER(${username})`)
    .leftJoin(
      schema.subscriptions,
      eq(schema.users.id, schema.subscriptions.userId)
    )
}

export const getUserByUsername = withDbTracing(
  'get-user-by-username',
  getUserByUsernameImpl
)

const insertUserImpl = async ({
  email,
  password,
  username,
  displayName,
}: InsertUserModel) => {
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

export const insertUser = withDbTracing('insert-user', insertUserImpl)

const updateUserImpl = async (userId: string, data: UpdateUserInput) => {
  return db
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.id, userId))
    .returning()
}

export const updateUser = withDbTracing('update-user', updateUserImpl)

const updateUserPasswordImpl = async (userId: string, password: string) => {
  return db
    .update(schema.users)
    .set({
      password: password,
      isLegacy: false,
    })
    .where(eq(schema.users.id, userId))
}

export const updateUserPassword = withDbTracing(
  'update-user-password',
  updateUserPasswordImpl
)

const getProUsersDetailsImpl = async () => {
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
    .where(eq(schema.subscriptions.type, 'PRO'))
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

export const getProUsersDetails = withDbTracing(
  'get-pro-users-details',
  getProUsersDetailsImpl
)

const listUsersByUsernameLikeImpl = async (username: string) => {
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
    .where(like(schema.users.username, `%${username}%`))
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

export const listUsersByUsernameLike = withDbTracing(
  'list-users-by-username-like',
  listUsersByUsernameLikeImpl
)
