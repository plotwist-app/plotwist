import type { FastifyRedis } from '@fastify/redis'

const STATS_CACHE_TTL_SECONDS = 60 * 60
const STATS_CACHE_SHORT_TTL_SECONDS = 10 * 60

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

  const isPeriodScoped =
    cacheKey.endsWith(':month') || cacheKey.endsWith(':last_month')
  const ttl = isPeriodScoped
    ? STATS_CACHE_SHORT_TTL_SECONDS
    : STATS_CACHE_TTL_SECONDS

  await redis.set(cacheKey, JSON.stringify(result), 'EX', ttl)

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
  language?: string,
  period?: string
): string {
  const parts = ['user-stats', userId, statType]
  if (language) parts.push(language)
  if (period && period !== 'all') parts.push(period)
  return parts.join(':')
}
