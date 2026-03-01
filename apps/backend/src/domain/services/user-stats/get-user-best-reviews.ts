import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import type { StatsPeriod } from '@/infra/http/schemas/common'
import { selectBestReviews } from '@/infra/db/repositories/reviews-repository'
import { getTMDBMovieService } from '../tmdb/get-tmdb-movie'
import { getTMDBTvSeriesService } from '../tmdb/get-tmdb-tv-series'
import { processInBatches } from './batch-utils'

type GetUserBestReviewsServiceInput = {
  userId: string
  redis: FastifyRedis
  language: Language
  limit?: number
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
  period?: StatsPeriod
}

export async function getUserBestReviewsService({
  userId,
  language,
  redis,
  limit,
  dateRange,
}: GetUserBestReviewsServiceInput) {
  const bestReviews = await selectBestReviews(
    userId,
    limit,
    dateRange?.startDate,
    dateRange?.endDate
  )

  const formattedBestReviews = await processInBatches(
    bestReviews,
    async review => {
      const { mediaType, tmdbId } = review

      const { title, posterPath, date } =
        mediaType === 'MOVIE'
          ? await getTMDBMovieService(redis, {
              tmdbId: tmdbId,
              language,
              returnDate: true,
            })
          : await getTMDBTvSeriesService(redis, {
              tmdbId: tmdbId,
              language,
              returnDate: true,
            })

      return {
        ...review,
        title,
        posterPath,
        date,
      }
    }
  )

  return {
    bestReviews: formattedBestReviews,
  }
}
