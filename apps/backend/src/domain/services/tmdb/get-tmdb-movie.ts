import type { FastifyRedis } from '@fastify/redis'
import type { Language, MovieDetails } from '@plotwist_app/tmdb'
import { tmdb } from '@/adapters/tmdb'

type GetTMDBMovieServiceInput = {
  tmdbId: number
  language: Language
  returnRuntime?: boolean
  returnGenres?: boolean
  returnCountries?: boolean
  returnDate?: boolean
}

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60

export async function getTMDBMovieService(
  redis: FastifyRedis,
  {
    tmdbId,
    language,
    returnRuntime = false,
    returnGenres = false,
    returnCountries = false,
    returnDate = false,
  }: GetTMDBMovieServiceInput
) {
  const cacheKey = `MOVIE:${tmdbId}:${language}`
  const cachedResult = await redis.get(cacheKey)

  if (cachedResult) {
    const data = JSON.parse(cachedResult) as MovieDetails

    return {
      title: data.title,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      ...(returnRuntime && { runtime: data.runtime }),
      ...(returnGenres && { genres: data.genres }),
      ...(returnCountries && { countries: data.production_countries }),
      ...(returnDate && { date: data.release_date }),
    }
  }

  const data = await tmdb.movies.details(tmdbId, language)
  await redis.set(cacheKey, JSON.stringify(data), 'EX', THIRTY_DAYS_IN_SECONDS)

  return {
    title: data.title,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    ...(returnRuntime && { runtime: data.runtime }),
    ...(returnGenres && { genres: data.genres }),
    ...(returnCountries && { countries: data.production_countries }),
    ...(returnDate && { date: data.release_date }),
  }
}
