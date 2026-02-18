import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import type { StatsPeriod } from '@/http/schemas/common'
import { selectMostWatched } from '@/db/repositories/user-episode'
import { getTMDBTvSeriesService } from '../tmdb/get-tmdb-tv-series'
import { processInBatches } from './batch-utils'

type GetUserMostWatchedSeriesServiceInput = {
  userId: string
  redis: FastifyRedis
  language: Language
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
  period?: StatsPeriod
}

export async function getUserMostWatchedSeriesService({
  userId,
  language,
  redis,
  dateRange,
}: GetUserMostWatchedSeriesServiceInput) {
  const mostWatchedSeries = await selectMostWatched(
    userId,
    dateRange?.startDate,
    dateRange?.endDate
  )

  const formattedMostWatchedSeries = await processInBatches(
    mostWatchedSeries,
    async ({ count, tmdbId }) => {
      const data = await getTMDBTvSeriesService(redis, {
        language: language,
        tmdbId: tmdbId,
      })

      return {
        episodes: count,
        id: tmdbId,
        ...data,
      }
    }
  )

  return { mostWatchedSeries: formattedMostWatchedSeries }
}
