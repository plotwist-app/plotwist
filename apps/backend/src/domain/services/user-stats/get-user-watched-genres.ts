import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import type { StatsPeriod } from '@/http/schemas/common'
import { selectAllUserItemsByStatus } from '@/db/repositories/user-item-repository'
import { selectUserEpisodes } from '@/db/repositories/user-episode'
import { getTMDBMovieService } from '../tmdb/get-tmdb-movie'
import { getTMDBTvSeriesService } from '../tmdb/get-tmdb-tv-series'
import { processInBatches } from './batch-utils'
import { getCachedStats, getUserStatsCacheKey } from './cache-utils'

type GetUserWatchedGenresServiceInput = {
  userId: string
  redis: FastifyRedis
  language: Language
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
  period?: StatsPeriod
}

export async function getUserWatchedGenresService({
  userId,
  redis,
  language,
  dateRange,
  period = 'all',
}: GetUserWatchedGenresServiceInput) {
  const cacheKey = getUserStatsCacheKey(userId, 'watched-genres-v2', language, period)

  return getCachedStats(redis, cacheKey, async () => {
    const watchedItems = await selectAllUserItemsByStatus({
      userId,
      status: 'WATCHED',
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    })

    const seenTmdbIds = new Set(watchedItems.map(item => item.tmdbId))

    // Also include series that had episodes watched in the date range,
    // even if the series user_item.updatedAt is outside the range
    if (dateRange?.startDate || dateRange?.endDate) {
      const episodesInRange = await selectUserEpisodes({
        userId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      const seriesTmdbIds = new Set(episodesInRange.map(ep => ep.tmdbId))
      for (const tmdbId of seriesTmdbIds) {
        if (!seenTmdbIds.has(tmdbId)) {
          seenTmdbIds.add(tmdbId)
          watchedItems.push({
            id: `ep-${tmdbId}`,
            tmdbId,
            mediaType: 'TV_SHOW' as const,
            position: null as unknown as number,
            updatedAt: new Date(),
          })
        }
      }
    }

    const genreCount = new Map<string, number>()
    const genrePoster = new Map<string, string>()

    await processInBatches(watchedItems, async item => {
      const { genres, posterPath } =
        item.mediaType === 'MOVIE'
          ? await getTMDBMovieService(redis, {
              tmdbId: item.tmdbId,
              returnGenres: true,
              language,
            })
          : await getTMDBTvSeriesService(redis, {
              tmdbId: item.tmdbId,
              returnGenres: true,
              language,
            })

      if (genres) {
        for (const genre of genres) {
          const currentCount = genreCount.get(genre.name) || 0
          genreCount.set(genre.name, currentCount + 1)
          if (posterPath && !genrePoster.has(genre.name)) {
            genrePoster.set(genre.name, posterPath)
          }
        }
      }
    })

    const totalItems = watchedItems.length
    const genres = Array.from(genreCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalItems > 0 ? (count / totalItems) * 100 : 0,
        posterPath: genrePoster.get(name) ?? null,
      }))
      .sort((a, b) => b.count - a.count)

    return { genres }
  })
}
