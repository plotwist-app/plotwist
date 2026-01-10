import type { FastifyRedis } from '@fastify/redis'
import type { Language, TvSerie } from '@plotwist_app/tmdb'
import { tmdb } from '@/adapters/tmdb'
import { SIX_MONTHS_IN_SECONDS } from './common'

type GetTMDBTvRelatedParams = {
  tmdbId: number
  language: Language
}

export async function getTMDBTvRelated(
  redis: FastifyRedis,
  { tmdbId, language }: GetTMDBTvRelatedParams
) {
  const cacheKey = `TV:${tmdbId}:RELATED:${language}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached) as TvSerie[]
  }

  const { results } = await tmdb.tv.related(tmdbId, 'recommendations', language)
  await redis.set(
    cacheKey,
    JSON.stringify(results),
    'EX',
    SIX_MONTHS_IN_SECONDS
  )

  return results
}
