import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import type { StatsPeriod } from '@/infra/http/schemas/common'
import { selectAllUserItemsByStatus } from '@/infra/db/repositories/user-item-repository'
import { getTMDBMovieService } from '../tmdb/get-tmdb-movie'
import { getTMDBTvSeriesService } from '../tmdb/get-tmdb-tv-series'
import { processInBatches } from './batch-utils'
import { getCachedStats, getUserStatsCacheKey } from './cache-utils'

type GetUserWatchedCountriesServiceInput = {
  userId: string
  redis: FastifyRedis
  language: Language
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
  period?: StatsPeriod
}

export async function getUserWatchedCountriesService({
  userId,
  redis,
  language,
  dateRange,
  period = 'all',
}: GetUserWatchedCountriesServiceInput) {
  const cacheKey = getUserStatsCacheKey(userId, 'watched-countries', language, period)

  return getCachedStats(redis, cacheKey, async () => {
    const watchedItems = await selectAllUserItemsByStatus({
      status: 'WATCHED',
      userId,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    })
    const countryCount = new Map<string, number>()

    await processInBatches(watchedItems, async ({ tmdbId, mediaType }) => {
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

    const countries = Array.from(countryCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / watchedItems.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)

    return { watchedCountries: countries }
  })
}
