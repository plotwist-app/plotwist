import type { FastifyRedis } from '@fastify/redis'

import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { Language } from '@plotwist_app/tmdb'
import { tmdb } from '@/adapters/tmdb'

type GetTMDBDataServiceInput = {
  mediaType: 'TV_SHOW' | 'MOVIE'
  tmdbId: number
  language: Language
}

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60

const getTMDBDataServiceImpl = async (
  redis: FastifyRedis,
  input: GetTMDBDataServiceInput
) => {
  const { mediaType, language, tmdbId } = input

  const cacheKey = `${mediaType}:${tmdbId}:${language}`
  const cachedResult = await redis.get(cacheKey)

  if (mediaType === 'TV_SHOW') {
    if (cachedResult) {
      const data = JSON.parse(cachedResult)

      return {
        title: data.name,
        posterPath: data.poster_path,
        backdropPath: data.backdrop_path,
      }
    }

    const data = await tmdb.tv.details(tmdbId, language)
    await redis.set(
      cacheKey,
      JSON.stringify(data),
      'EX',
      THIRTY_DAYS_IN_SECONDS
    )

    return {
      title: data.name,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
    }
  }

  if (cachedResult) {
    const data = JSON.parse(cachedResult)

    return {
      title: data.title,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
    }
  }

  const data = await tmdb.movies.details(tmdbId, language)
  await redis.set(cacheKey, JSON.stringify(data), 'EX', THIRTY_DAYS_IN_SECONDS)

  return {
    title: data.title,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
  }
}

export const getTMDBDataService = withServiceTracing(
  'get-tmdb-data',
  getTMDBDataServiceImpl
)
