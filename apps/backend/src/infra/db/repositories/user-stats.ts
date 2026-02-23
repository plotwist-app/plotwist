import { and, eq, sql } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'

export async function selectUserStats(userId: string) {
  const [
    [{ count: followersCount }],
    [{ count: followingCount }],
    [{ count: watchedMoviesCount }],
    [{ count: watchedSeriesCount }],
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.followers)
      .where(eq(schema.followers.followedId, userId)),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.followers)
      .where(eq(schema.followers.followerId, userId)),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.userItems)
      .where(
        and(
          eq(schema.userItems.userId, userId),
          eq(schema.userItems.mediaType, 'MOVIE'),
          eq(schema.userItems.status, 'WATCHED')
        )
      ),

    db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.userItems)
      .where(
        and(
          eq(schema.userItems.userId, userId),
          eq(schema.userItems.mediaType, 'TV_SHOW'),
          eq(schema.userItems.status, 'WATCHED')
        )
      ),
  ])

  return {
    followersCount,
    followingCount,
    watchedMoviesCount,
    watchedSeriesCount,
  }
}
