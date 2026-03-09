import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { periodToDateRange } from '@/infra/http/schemas/common'
import { getUserBestReviewsService } from './get-user-best-reviews'
import { getUserTotalHoursService } from './get-user-total-hours'
import { getUserWatchedGenresService } from './get-user-watched-genres'

type GetUserStatsTimelineInput = {
  userId: string
  redis: FastifyRedis
  language: Language
  cursor?: string
  pageSize?: number
}

export async function getUserStatsTimelineService({
  userId,
  redis,
  language,
  cursor,
  pageSize = 3,
}: GetUserStatsTimelineInput) {
  const maxScanMonths = 24
  const sections: Array<{
    yearMonth: string
    totalHours: number
    movieHours: number
    seriesHours: number
    topGenre: { name: string; posterPath: string | null } | null
    topReview: {
      title: string
      posterPath: string | null
      rating: number
    } | null
  }> = []

  let currentYM = cursor || getCurrentYearMonth()
  let scanned = 0

  while (sections.length < pageSize && scanned < maxScanMonths) {
    const period = currentYM
    const dateRange = periodToDateRange(period)

    const [hours, genres, reviews] = await Promise.all([
      getUserTotalHoursService(userId, redis, period, dateRange),
      getUserWatchedGenresService({
        userId,
        redis,
        language,
        dateRange,
        period,
      }),
      getUserBestReviewsService({
        userId,
        redis,
        language,
        limit: 1,
        dateRange,
        period,
      }),
    ])

    const hasData =
      hours.totalHours > 0 ||
      genres.genres.length > 0 ||
      reviews.bestReviews.length > 0

    if (hasData) {
      const topGenreData = genres.genres[0]
      const topReviewData = reviews.bestReviews[0] as
        | Record<string, unknown>
        | undefined

      sections.push({
        yearMonth: currentYM,
        totalHours: hours.totalHours,
        movieHours: hours.movieHours,
        seriesHours: hours.seriesHours,
        topGenre: topGenreData
          ? {
              name: topGenreData.name,
              posterPath: topGenreData.posterPath,
            }
          : null,
        topReview: topReviewData
          ? {
              title: topReviewData.title as string,
              posterPath: (topReviewData.posterPath ?? null) as string | null,
              rating: topReviewData.rating as number,
            }
          : null,
      })
    }

    currentYM = getPreviousYearMonth(currentYM)
    scanned++
  }

  const hasMore = sections.length >= pageSize && scanned < maxScanMonths

  return {
    sections,
    nextCursor: hasMore ? currentYM : null,
    hasMore,
  }
}

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getPreviousYearMonth(ym: string): string {
  const [year, month] = ym.split('-').map(Number)
  if (month === 1) {
    return `${year - 1}-12`
  }
  return `${year}-${String(month - 1).padStart(2, '0')}`
}
