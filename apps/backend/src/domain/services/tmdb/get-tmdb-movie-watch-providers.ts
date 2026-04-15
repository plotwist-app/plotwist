import type { FastifyRedis } from '@fastify/redis'
import type { WatchLocale } from '@plotwist_app/tmdb'
import { tmdb } from '@/infra/adapters/tmdb'
import { SIX_MONTHS_IN_SECONDS } from './common'

type GetTMDBMovieWatchProvidersParams = {
  redis: FastifyRedis
  tmdbId: number
}

export async function getTMDBMovieWatchProviders({
  redis,
  tmdbId,
}: GetTMDBMovieWatchProvidersParams) {
  const cacheKey = `MOVIE:${tmdbId}:WATCH_PROVIDERS`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached) as WatchLocale
  }

  const { results } = await tmdb.watchProviders.item('movie', tmdbId)
  await redis.set(
    cacheKey,
    JSON.stringify(results),
    'EX',
    SIX_MONTHS_IN_SECONDS
  )

  return results
}
