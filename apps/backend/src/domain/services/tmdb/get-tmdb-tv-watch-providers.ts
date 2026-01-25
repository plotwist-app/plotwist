import type { FastifyRedis } from '@fastify/redis'
import type { WatchLocale } from '@plotwist_app/tmdb'
import { tmdb } from '@/adapters/tmdb'
import { SIX_MONTHS_IN_SECONDS } from './common'

type GetTMDBTvWatchProvidersParams = {
  redis: FastifyRedis
  tmdbId: number
}

export async function getTMDBTvWatchProviders({
  redis,
  tmdbId,
}: GetTMDBTvWatchProvidersParams) {
  const cacheKey = `TV:${tmdbId}:WATCH_PROVIDERS`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached) as WatchLocale
  }

  const { results } = await tmdb.watchProviders.item('tv', tmdbId)
  await redis.set(
    cacheKey,
    JSON.stringify(results),
    'EX',
    SIX_MONTHS_IN_SECONDS
  )

  return results
}
