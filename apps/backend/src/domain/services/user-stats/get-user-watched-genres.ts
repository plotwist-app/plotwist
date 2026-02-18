import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { selectUserEpisodes } from '@/db/repositories/user-episode'
import { selectAllUserItemsByStatus } from '@/db/repositories/user-item-repository'
import type { StatsPeriod } from '@/http/schemas/common'
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
  const cacheKey = getUserStatsCacheKey(
    userId,
    'watched-genres-v5',
    language,
    period
  )

  return getCachedStats(redis, cacheKey, async () => {
    const hasDateRange = dateRange?.startDate || dateRange?.endDate

    const [watchedItems, episodesInRange] = await Promise.all([
      selectAllUserItemsByStatus({
        userId,
        status: 'WATCHED',
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
      }),
      hasDateRange
        ? selectUserEpisodes({
            userId,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
          })
        : Promise.resolve([]),
    ])

    if (hasDateRange && episodesInRange.length > 0) {
      const seenTmdbIds = new Set(watchedItems.map(item => item.tmdbId))
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

    type GenreItem = {
      tmdbId: number
      mediaType: string
      posterPath: string | null
    }
    const genreCount = new Map<string, number>()
    const genreItems = new Map<string, GenreItem[]>()

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
        const mediaType = item.mediaType === 'MOVIE' ? 'movie' : 'tv'
        for (const genre of genres) {
          const currentCount = genreCount.get(genre.name) || 0
          genreCount.set(genre.name, currentCount + 1)

          const items = genreItems.get(genre.name) || []
          if (!items.some(i => i.tmdbId === item.tmdbId)) {
            items.push({
              tmdbId: item.tmdbId,
              mediaType,
              posterPath: posterPath ?? null,
            })
            genreItems.set(genre.name, items)
          }
        }
      }
    })

    const totalItems = watchedItems.length
    const genres = Array.from(genreCount)
      .map(([name, count]) => {
        const items = genreItems.get(name) || []
        return {
          name,
          count,
          percentage: totalItems > 0 ? (count / totalItems) * 100 : 0,
          posterPath: items[0]?.posterPath ?? null,
          posterPaths: items.map(i => i.posterPath).filter(Boolean) as string[],
          items,
        }
      })
      .sort((a, b) => b.count - a.count)

    return { genres }
  })
}
