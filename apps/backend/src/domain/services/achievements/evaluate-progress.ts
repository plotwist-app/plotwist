import { and, count, eq, inArray } from 'drizzle-orm'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'
import type { AchievementCriteria } from '@/infra/db/schema/achievements'

export async function evaluateProgress(
  userId: string,
  criteria: AchievementCriteria
): Promise<number> {
  switch (criteria.type) {
    case 'ITEMS_WATCHED':
      return countUserItems(userId, 'WATCHED', criteria.mediaType)

    case 'ITEMS_IN_COLLECTION':
      return countUserItems(userId, undefined, criteria.mediaType)

    case 'REVIEWS_WRITTEN':
      return countReviews(userId)

    case 'FOLLOWERS_COUNT':
      return countFollowers(userId)

    case 'FOLLOWING_COUNT':
      return countFollowing(userId)

    case 'LISTS_CREATED':
      return countLists(userId)

    case 'FAVORITES_COUNT':
      return countFavorites(userId)

    case 'EPISODES_WATCHED':
      return countEpisodes(userId)

    case 'TMDB_SET':
      return countTmdbSet(userId, criteria.tmdbIds, criteria.mediaType)

    default:
      return 0
  }
}

async function countUserItems(
  userId: string,
  status?: 'WATCHLIST' | 'WATCHED' | 'WATCHING' | 'DROPPED',
  mediaType?: 'MOVIE' | 'TV_SHOW'
): Promise<number> {
  const conditions = [eq(schema.userItems.userId, userId)]
  if (status) conditions.push(eq(schema.userItems.status, status))
  if (mediaType) conditions.push(eq(schema.userItems.mediaType, mediaType))

  const [result] = await db
    .select({ count: count() })
    .from(schema.userItems)
    .where(and(...conditions))

  return result?.count ?? 0
}

async function countTmdbSet(
  userId: string,
  tmdbIds: number[],
  mediaType: 'MOVIE' | 'TV_SHOW'
): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.userItems)
    .where(
      and(
        eq(schema.userItems.userId, userId),
        eq(schema.userItems.status, 'WATCHED'),
        eq(schema.userItems.mediaType, mediaType),
        inArray(schema.userItems.tmdbId, tmdbIds)
      )
    )

  return result?.count ?? 0
}

async function countReviews(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.reviews)
    .where(eq(schema.reviews.userId, userId))
  return result?.count ?? 0
}

async function countFollowers(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.followers)
    .where(eq(schema.followers.followedId, userId))
  return result?.count ?? 0
}

async function countFollowing(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.followers)
    .where(eq(schema.followers.followerId, userId))
  return result?.count ?? 0
}

async function countLists(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.lists)
    .where(eq(schema.lists.userId, userId))
  return result?.count ?? 0
}

async function countFavorites(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.userFavorites)
    .where(eq(schema.userFavorites.userId, userId))
  return result?.count ?? 0
}

async function countEpisodes(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(schema.userEpisodes)
    .where(eq(schema.userEpisodes.userId, userId))
  return result?.count ?? 0
}
