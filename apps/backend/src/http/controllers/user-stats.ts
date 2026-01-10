import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getUserBestReviewsService } from '@/domain/services/user-stats/get-user-best-reviews'
import { getUserItemsStatusService } from '@/domain/services/user-stats/get-user-items-status'
import { getUserMostWatchedSeriesService } from '@/domain/services/user-stats/get-user-most-watched-series'
import { getUserReviewsCountService } from '@/domain/services/user-stats/get-user-reviews-count'
import { getUserStatsService } from '@/domain/services/user-stats/get-user-stats'
import { getUserTotalHoursService } from '@/domain/services/user-stats/get-user-total-hours'
import { getUserWatchedCastService } from '@/domain/services/user-stats/get-user-watched-cast'
import { getUserWatchedCountriesService } from '@/domain/services/user-stats/get-user-watched-countries'
import { getUserWatchedGenresService } from '@/domain/services/user-stats/get-user-watched-genres'
import { languageQuerySchema } from '../schemas/common'
import { getUserDefaultSchema } from '../schemas/user-stats'

export async function getUserStatsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = getUserDefaultSchema.parse(request.params)

  const result = await getUserStatsService(id)

  return reply.status(200).send(result.userStats)
}

export async function getUserTotalHoursController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { id } = getUserDefaultSchema.parse(request.params)
  const result = await getUserTotalHoursService(id, redis)

  return reply.status(200).send(result)
}

export async function getUserReviewsCountController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = getUserDefaultSchema.parse(request.params)
  const result = await getUserReviewsCountService(id)

  return reply.status(200).send(result)
}

export async function getUserMostWatchedSeriesController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { language } = languageQuerySchema.parse(request.query)
  const { id } = getUserDefaultSchema.parse(request.params)

  const result = await getUserMostWatchedSeriesService({
    userId: id,
    redis,
    language,
  })

  return reply.status(200).send(result)
}

export async function getUserWatchedGenresController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { language } = languageQuerySchema.parse(request.query)
  const { id } = getUserDefaultSchema.parse(request.params)

  const result = await getUserWatchedGenresService({
    userId: id,
    redis,
    language,
  })

  return reply.status(200).send(result)
}

export async function getUserWatchedCastController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { id } = getUserDefaultSchema.parse(request.params)
  const result = await getUserWatchedCastService({ userId: id, redis })

  return reply.status(200).send(result)
}

export async function getUserWatchedCountriesController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { id } = getUserDefaultSchema.parse(request.params)
  const { language } = languageQuerySchema.parse(request.query)

  const result = await getUserWatchedCountriesService({
    userId: id,
    redis,
    language,
  })

  return reply.status(200).send(result)
}

export async function getUserBestReviewsController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { id } = getUserDefaultSchema.parse(request.params)
  const { language } = languageQuerySchema.parse(request.query)

  const result = await getUserBestReviewsService({
    userId: id,
    redis,
    language,
  })

  return reply.status(200).send(result)
}

export async function getUserItemsStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = getUserDefaultSchema.parse(request.params)

  const result = await getUserItemsStatusService({
    userId: id,
  })

  return reply.status(200).send(result)
}
