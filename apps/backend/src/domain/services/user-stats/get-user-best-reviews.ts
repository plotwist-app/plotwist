import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { selectBestReviews } from '@/db/repositories/reviews-repository'
import { getTMDBMovieService } from '../tmdb/get-tmdb-movie'
import { getTMDBTvSeriesService } from '../tmdb/get-tmdb-tv-series'
import { processInBatches } from './batch-utils'

type GetUserBestReviewsServiceInput = {
  userId: string
  redis: FastifyRedis
  language: Language
}

export async function getUserBestReviewsService({
  userId,
  language,
  redis,
}: GetUserBestReviewsServiceInput) {
  // Note: Not using cache here because createdAt Date serialization
  // causes issues when retrieved from Redis (Date becomes string)
  const bestReviews = await selectBestReviews(userId)

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
