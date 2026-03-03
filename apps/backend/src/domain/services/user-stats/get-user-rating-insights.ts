import type { FastifyRedis } from '@fastify/redis'
import { sql } from 'drizzle-orm'
import { db } from '@/infra/db'
import type { StatsPeriod } from '@/infra/http/schemas/common'
import { getCachedStats, getUserStatsCacheKey } from './cache-utils'

type GetUserRatingInsightsInput = {
  userId: string
  redis: FastifyRedis
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
  period?: StatsPeriod
}

export async function getUserRatingInsightsService({
  userId,
  redis,
  dateRange,
  period = 'all',
}: GetUserRatingInsightsInput) {
  const cacheKey = getUserStatsCacheKey(userId, 'rating-insights', undefined, period)

  return getCachedStats(redis, cacheKey, async () => {
    const dateFilters = buildDateFilters(dateRange)

    const rows = await db.execute(sql`
      SELECT
        ROUND((rating * 2)::numeric, 0) / 2 AS bucket,
        COUNT(*)::int AS count
      FROM reviews
      WHERE user_id = ${userId}
        ${dateFilters}
      GROUP BY bucket
      ORDER BY bucket
    `)

    const ALL_RATINGS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    const countsByRating = new Map<number, number>()

    for (const rating of ALL_RATINGS) {
      countsByRating.set(rating, 0)
    }

    let totalReviews = 0
    let weightedSum = 0

    for (const row of rows) {
      const r = row as { bucket: string; count: number }
      const rating = Number.parseFloat(r.bucket)
      const count = r.count

      countsByRating.set(rating, count)
      totalReviews += count
      weightedSum += rating * count
    }

    const distribution = ALL_RATINGS.map(rating => ({
      rating,
      count: countsByRating.get(rating) || 0,
    }))

    const averageRating =
      totalReviews > 0 ? Math.round((weightedSum / totalReviews) * 100) / 100 : 0

    let mostFrequentRating = 0
    let maxCount = 0
    for (const { rating, count } of distribution) {
      if (count > maxCount) {
        maxCount = count
        mostFrequentRating = rating
      }
    }

    return {
      ratingInsights: {
        averageRating,
        totalReviews,
        mostFrequentRating,
        distribution,
      },
    }
  })
}

function buildDateFilters(
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
) {
  if (!dateRange?.startDate && !dateRange?.endDate) {
    return sql``
  }

  if (dateRange.startDate && dateRange.endDate) {
    return sql`AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}`
  }

  if (dateRange.startDate) {
    return sql`AND created_at >= ${dateRange.startDate}`
  }

  return sql`AND created_at <= ${dateRange.endDate as Date}`
}
