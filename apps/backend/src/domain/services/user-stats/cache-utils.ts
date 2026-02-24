import type { FastifyRedis } from '@fastify/redis'

// Cache duration for computed statistics (1 hour)
// Short TTL ensures data freshness while still providing significant performance benefit
const STATS_CACHE_TTL_SECONDS = 60 * 60

/**
 * Helper to cache computed statistics results
 * This caches the final aggregated result, not individual TMDB calls
 */
export async function getCachedStats<T>(
  redis: FastifyRedis,
  cacheKey: string,
  computeFn: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached) as T
  }

  const result = await computeFn()
  await redis.set(
    cacheKey,
    JSON.stringify(result),
    'EX',
    STATS_CACHE_TTL_SECONDS
  )

  return result
}

/**
 * Invalidate all stats cache for a user
 * Call this when user adds/removes items or changes status
 */
export async function invalidateUserStatsCache(
  redis: FastifyRedis,
  userId: string
): Promise<void> {
  const pattern = `user-stats:${userId}:*`
  const keys = await redis.keys(pattern)

  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

/**
 * Generate a cache key for user stats
 */
export function getUserStatsCacheKey(
  userId: string,
  statType: string,
  language?: string
): string {
  if (language) {
    return `user-stats:${userId}:${statType}:${language}`
  }
  return `user-stats:${userId}:${statType}`
}
