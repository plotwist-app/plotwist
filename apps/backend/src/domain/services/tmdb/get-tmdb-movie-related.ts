import { tmdb } from '@/adapters/tmdb'
import type { FastifyRedis } from '@fastify/redis'
import type { Language, Movie } from '@plotwist_app/tmdb'
import { SIX_MONTHS_IN_SECONDS } from './common'

type GetTMDBMovieRelatedParams = {
  tmdbId: number
  language: Language
}

export async function getTMDBMovieRelated(
  redis: FastifyRedis,
  { tmdbId, language }: GetTMDBMovieRelatedParams
) {
  const cacheKey = `MOVIE:${tmdbId}:RELATED:${language}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    return JSON.parse(cached) as Movie[]
  }

  const { results } = await tmdb.movies.related(
    tmdbId,
    'recommendations',
    language
  )

  await redis.set(
    cacheKey,
    JSON.stringify(results),
    'EX',
    SIX_MONTHS_IN_SECONDS
  )

  return results
}
