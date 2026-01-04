import { and, eq, sql } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'

export async function selectUserStats(userId: string) {
  const result = await db.transaction(async tx => {
    const [{ count: followersCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.followers)
      .where(eq(schema.followers.followedId, userId))

    const [{ count: followingCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.followers)
      .where(eq(schema.followers.followerId, userId))

    const [{ count: watchedMoviesCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.userItems)
      .where(
        and(
          eq(schema.userItems.userId, userId),
          eq(schema.userItems.mediaType, 'MOVIE'),
          eq(schema.userItems.status, 'WATCHED')
        )
      )

    const [{ count: watchedSeriesCount }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.userItems)
      .where(
        and(
          eq(schema.userItems.userId, userId),
          eq(schema.userItems.mediaType, 'TV_SHOW'),
          eq(schema.userItems.status, 'WATCHED')
        )
      )

    return {
      followersCount,
      followingCount,
      watchedMoviesCount,
      watchedSeriesCount,
    }
  })

  return result
}
