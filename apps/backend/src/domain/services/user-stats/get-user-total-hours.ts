import type { FastifyRedis } from '@fastify/redis'
import { sql } from 'drizzle-orm'
import { db } from '@/infra/db'
import type { StatsPeriod } from '@/infra/http/schemas/common'
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
    'total-hours-v6',
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

    const { peakTimeSlot, hourlyDistribution } = computePeakAndHourly(
      movieRuntimesWithDates,
      watchedEpisodes.userEpisodes
    )

    const dailyActivity = computeAllDailyActivity(
      movieRuntimesWithDates,
      watchedEpisodes.userEpisodes,
      period
    )

    const percentileRank =
      period === 'all' ? await computeUserPercentile(userId) : null

    return {
      totalHours,
      movieHours: movieTotalHours,
      seriesHours: episodeTotalHours,
      monthlyHours,
      peakTimeSlot,
      hourlyDistribution,
      dailyActivity,
      percentileRank,
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

function computeAllDailyActivity(
  movieData: { runtime: number; date: Date | null }[],
  episodes: { runtime: number; watchedAt: Date | null }[],
  period: StatsPeriod
) {
  const now = new Date()
  let startDate: Date
  let endDate: Date

  if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    endDate = now
  } else if (period === 'last_month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    endDate = new Date(now.getFullYear(), now.getMonth(), 0)
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1)
    endDate = now
  } else {
    const allDates = [
      ...movieData.filter(m => m.date).map(m => m.date!.getTime()),
      ...episodes.filter(e => e.watchedAt).map(e => e.watchedAt!.getTime()),
    ]
    if (allDates.length === 0) return []
    startDate = new Date(Math.min(...allDates))
    startDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    )
    endDate = now
  }

  const dayMap = new Map<string, number>()
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    dayMap.set(key, 0)
    cursor.setDate(cursor.getDate() + 1)
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

  return Array.from(dayMap.entries()).map(([day, hours]) => ({
    day,
    hours: Math.round(hours * 10) / 10,
  }))
}

function computePeakAndHourly(
  movieData: { runtime: number; date: Date | null }[],
  episodes: { runtime: number; watchedAt: Date | null }[]
): {
  peakTimeSlot: { slot: string; hour: number; count: number } | null
  hourlyDistribution: { hour: number; count: number }[]
} {
  const hourCounts = new Array(24).fill(0)

  for (const movie of movieData) {
    if (!movie.date) continue
    hourCounts[movie.date.getHours()]++
  }

  for (const ep of episodes) {
    if (!ep.watchedAt) continue
    hourCounts[ep.watchedAt.getHours()]++
  }

  const hourlyDistribution = hourCounts.map((count: number, hour: number) => ({
    hour,
    count,
  }))

  const totalEntries = hourCounts.reduce((a: number, b: number) => a + b, 0)
  if (totalEntries === 0) return { peakTimeSlot: null, hourlyDistribution }

  const slots = [
    { slot: 'night', range: [0, 1, 2, 3, 4, 5], count: 0 },
    { slot: 'morning', range: [6, 7, 8, 9, 10, 11], count: 0 },
    { slot: 'afternoon', range: [12, 13, 14, 15, 16, 17], count: 0 },
    { slot: 'evening', range: [18, 19, 20, 21, 22, 23], count: 0 },
  ]

  for (const s of slots) {
    s.count = s.range.reduce((sum, h) => sum + hourCounts[h], 0)
  }

  const peak = slots.reduce(
    (max, s) => (s.count > max.count ? s : max),
    slots[0]
  )
  const peakHour = peak.range.reduce(
    (maxH, h) => (hourCounts[h] > hourCounts[maxH] ? h : maxH),
    peak.range[0]
  )

  return {
    peakTimeSlot: { slot: peak.slot, hour: peakHour, count: peak.count },
    hourlyDistribution,
  }
}

function sumRuntimes(runtimes: number[]): number {
  return runtimes.reduce((acc, curr) => acc + curr, 0) / 60
}

async function computeUserPercentile(userId: string): Promise<number | null> {
  const rows = await db.execute(sql`
    WITH user_counts AS (
      SELECT user_id, COUNT(*)::int AS item_count
      FROM user_items
      WHERE status = 'WATCHED'
      GROUP BY user_id
    )
    SELECT
      (SELECT item_count FROM user_counts WHERE user_id = ${userId}) AS user_count,
      COUNT(*)::int AS total_users,
      (SELECT COUNT(*)::int FROM user_counts
       WHERE item_count < (SELECT item_count FROM user_counts WHERE user_id = ${userId})
      ) AS users_below
    FROM user_counts
  `)

  const row = rows[0] as
    | { user_count: number | null; total_users: number; users_below: number }
    | undefined

  if (!row?.user_count || row.total_users <= 1) return null

  const percentile = Math.round((row.users_below / row.total_users) * 100)

  return Math.max(1, percentile)
}
