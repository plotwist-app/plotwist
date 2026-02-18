import type { FastifyRedis } from '@fastify/redis'
import type { StatsPeriod } from '@/http/schemas/common'
import { getTMDBMovieService } from '../tmdb/get-tmdb-movie'
import { getUserEpisodesService } from '../user-episodes/get-user-episodes'
import { getAllUserItemsService } from '../user-items/get-all-user-items'
import { processInBatches } from './batch-utils'
import { getCachedStats, getUserStatsCacheKey } from './cache-utils'

type DateRange = { startDate: Date | undefined; endDate: Date | undefined }

export async function getUserTotalHoursService(
  userId: string,
  redis: FastifyRedis,
  period: StatsPeriod = 'all',
  dateRange: DateRange = { startDate: undefined, endDate: undefined }
) {
  const cacheKey = getUserStatsCacheKey(
    userId,
    'total-hours-v2',
    undefined,
    period
  )

  return getCachedStats(redis, cacheKey, async () => {
    const [watchedItems, watchedEpisodes] = await Promise.all([
      getAllUserItemsService({
        userId,
        status: 'WATCHED',
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }),
      getUserEpisodesService({
        userId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }),
    ])

    const movieRuntimesWithDates = await getMovieRuntimesWithDates(
      watchedItems,
      redis
    )
    const movieTotalHours = sumRuntimes(
      movieRuntimesWithDates.map(m => m.runtime)
    )

    const episodeTotalHours = sumRuntimes(
      watchedEpisodes.userEpisodes.map(ep => ep.runtime)
    )

    const totalHours = movieTotalHours + episodeTotalHours

    const monthlyHours = computeMonthlyHours(
      movieRuntimesWithDates,
      watchedEpisodes.userEpisodes,
      period
    )

    return {
      totalHours,
      movieHours: movieTotalHours,
      seriesHours: episodeTotalHours,
      monthlyHours,
    }
  })
}

async function getMovieRuntimesWithDates(
  watchedItems: Awaited<ReturnType<typeof getAllUserItemsService>>,
  redis: FastifyRedis
) {
  const movies = watchedItems.userItems.filter(
    item => item.mediaType === 'MOVIE'
  )

  return processInBatches(movies, async item => {
    const { runtime } = await getTMDBMovieService(redis, {
      language: 'en-US',
      tmdbId: item.tmdbId,
      returnRuntime: true,
    })
    return { runtime: runtime || 0, date: item.updatedAt }
  })
}

function computeMonthlyHours(
  movieData: { runtime: number; date: Date | null }[],
  episodes: { runtime: number; watchedAt: Date | null }[],
  period: StatsPeriod = 'all'
) {
  if (period === 'month' || period === 'last_month') {
    return computeDailyBreakdown(movieData, episodes, period)
  }

  const monthCount = period === 'year' ? 12 : 12
  const monthMap = new Map<string, number>()
  const now = new Date()

  if (period === 'year') {
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, 0)
    }
  } else {
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(key, 0)
    }
  }

  for (const movie of movieData) {
    if (!movie.date) continue
    const key = `${movie.date.getFullYear()}-${String(movie.date.getMonth() + 1).padStart(2, '0')}`
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) || 0) + movie.runtime / 60)
    }
  }

  for (const ep of episodes) {
    if (!ep.watchedAt) continue
    const key = `${ep.watchedAt.getFullYear()}-${String(ep.watchedAt.getMonth() + 1).padStart(2, '0')}`
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) || 0) + ep.runtime / 60)
    }
  }

  return Array.from(monthMap.entries()).map(([month, hours]) => ({
    month,
    hours: Math.round(hours * 10) / 10,
  }))
}

function computeDailyBreakdown(
  movieData: { runtime: number; date: Date | null }[],
  episodes: { runtime: number; watchedAt: Date | null }[],
  period: 'month' | 'last_month'
) {
  const now = new Date()
  let year: number
  let month: number

  if (period === 'month') {
    year = now.getFullYear()
    month = now.getMonth()
  } else {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    year = lastMonth.getFullYear()
    month = lastMonth.getMonth()
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dayMap = new Map<string, number>()

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    dayMap.set(key, 0)
  }

  for (const movie of movieData) {
    if (!movie.date) continue
    const key = `${movie.date.getFullYear()}-${String(movie.date.getMonth() + 1).padStart(2, '0')}-${String(movie.date.getDate()).padStart(2, '0')}`
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) || 0) + movie.runtime / 60)
    }
  }

  for (const ep of episodes) {
    if (!ep.watchedAt) continue
    const key = `${ep.watchedAt.getFullYear()}-${String(ep.watchedAt.getMonth() + 1).padStart(2, '0')}-${String(ep.watchedAt.getDate()).padStart(2, '0')}`
    if (dayMap.has(key)) {
      dayMap.set(key, (dayMap.get(key) || 0) + ep.runtime / 60)
    }
  }

  return Array.from(dayMap.entries()).map(([month, hours]) => ({
    month,
    hours: Math.round(hours * 10) / 10,
  }))
}

function sumRuntimes(runtimes: number[]): number {
  return runtimes.reduce((acc, curr) => acc + curr, 0) / 60
}
