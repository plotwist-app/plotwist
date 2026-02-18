import { and, eq, sql } from 'drizzle-orm'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { schema } from '../schema'

const selectUserStatsImpl = async (userId: string) => {
  // Run all independent queries in parallel instead of sequential transaction
  // This improves performance as these are all read-only operations
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

export const selectUserStats = withDbTracing(
  'select-user-stats',
  selectUserStatsImpl
)
