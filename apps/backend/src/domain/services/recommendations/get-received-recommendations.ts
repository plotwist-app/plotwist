import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import { getTMDBDataService } from '@/domain/services/tmdb/get-tmdb-data'
import { selectReceivedRecommendations } from '@/infra/db/repositories/recommendations-repository'

export async function getReceivedRecommendationsService(
  userId: string,
  redis: FastifyRedis,
  language: Language
) {
  const rows = await selectReceivedRecommendations(userId)

  const recommendations = await Promise.all(
    rows.map(async row => {
      const tmdbData = await getTMDBDataService(redis, {
        mediaType: row.mediaType,
        tmdbId: row.tmdbId,
        language,
      })

      return {
        ...row,
        mediaTitle: tmdbData.title,
        mediaPosterPath: tmdbData.posterPath,
        mediaOverview: tmdbData.overview,
      }
    })
  )

  return { recommendations }
}
