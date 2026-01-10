import type { FastifyRedis } from '@fastify/redis'
import type { Language, TvSerieDetails } from '@plotwist_app/tmdb'
import { tmdb } from '@/adapters/tmdb'

type GetTMDBTvSeriesServiceInput = {
  tmdbId: number
  language: Language
  returnSeasons?: boolean
  returnGenres?: boolean
  returnCountries?: boolean
  returnDate?: boolean
}

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60

export async function getTMDBTvSeriesService(
  redis: FastifyRedis,
  {
    tmdbId,
    language,
    returnSeasons = false,
    returnGenres = false,
    returnCountries = false,
    returnDate = false,
  }: GetTMDBTvSeriesServiceInput
) {
  const cacheKey = `TV_SHOW:${tmdbId}:${language}`
  const cachedResult = await redis.get(cacheKey)

  if (cachedResult) {
    const data = JSON.parse(cachedResult) as TvSerieDetails
    return {
      title: data.name,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      ...(returnSeasons && { seasons: data.seasons }),
      ...(returnGenres && { genres: data.genres }),
      ...(returnCountries && { countries: data.production_countries }),
      ...(returnDate && { date: data.first_air_date }),
    }
  }

  const data = await tmdb.tv.details(tmdbId, language)
  await redis.set(cacheKey, JSON.stringify(data), 'EX', THIRTY_DAYS_IN_SECONDS)

  return {
    title: data.name,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    ...(returnSeasons && { seasons: data.seasons }),
    ...(returnGenres && { genres: data.genres }),
    ...(returnCountries && { countries: data.production_countries }),
    ...(returnDate && { date: data.first_air_date }),
  }
}
