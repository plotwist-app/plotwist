import type { FastifyRedis } from '@fastify/redis'
import { getTMDBMovieService } from '../tmdb/get-tmdb-movie'
import { getUserEpisodesService } from '../user-episodes/get-user-episodes'
import { getAllUserItemsService } from '../user-items/get-all-user-items'
import { processInBatches } from './batch-utils'
import { getCachedStats, getUserStatsCacheKey } from './cache-utils'

export async function getUserTotalHoursService(
  userId: string,
  redis: FastifyRedis
) {
  const cacheKey = getUserStatsCacheKey(userId, 'total-hours-v2')

  return getCachedStats(redis, cacheKey, async () => {
    const watchedItems = await getAllUserItemsService({
      userId,
      status: 'WATCHED',
    })

    const movieRuntimesWithDates = await getMovieRuntimesWithDates(
      watchedItems,
      redis
    )
    const movieTotalHours = sumRuntimes(
      movieRuntimesWithDates.map(m => m.runtime)
    )

    const watchedEpisodes = await getUserEpisodesService({ userId })
    const episodeTotalHours = sumRuntimes(
      watchedEpisodes.userEpisodes.map(ep => ep.runtime)
    )

    const totalHours = movieTotalHours + episodeTotalHours

    const monthlyHours = computeMonthlyHours(
      movieRuntimesWithDates,
      watchedEpisodes.userEpisodes
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
  episodes: { runtime: number; watchedAt: Date | null }[]
) {
  const monthMap = new Map<string, number>()

  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, 0)
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

function sumRuntimes(runtimes: number[]): number {
  return runtimes.reduce((acc, curr) => acc + curr, 0) / 60
}
