import { selectAllUserItemsByStatus } from '@/db/repositories/user-item-repository'
import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { getTMDBMovieService } from '../tmdb/get-tmdb-movie'
import { getTMDBTvSeriesService } from '../tmdb/get-tmdb-tv-series'

type GetUserWatchedCountriesServiceInput = {
  userId: string
  redis: FastifyRedis
  language: Language
}

export async function getUserWatchedCountriesService({
  userId,
  redis,
  language,
}: GetUserWatchedCountriesServiceInput) {
  const watchedItems = await selectAllUserItemsByStatus({
    status: 'WATCHED',
    userId,
  })
  const countryCount = new Map()

  await Promise.all(
    watchedItems.map(async ({ tmdbId, mediaType }) => {
      const { countries } =
        mediaType === 'MOVIE'
          ? await getTMDBMovieService(redis, {
              tmdbId: tmdbId,
              language,
              returnCountries: true,
            })
          : await getTMDBTvSeriesService(redis, {
              tmdbId: tmdbId,
              language,
              returnCountries: true,
            })

      if (countries) {
        for (const country of countries) {
          const currentCount = countryCount.get(country.name) || 0
          countryCount.set(country.name, currentCount + 1)
        }
      }
    })
  )

  const countries = Array.from(countryCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / watchedItems.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)

  return { watchedCountries: countries }
}
