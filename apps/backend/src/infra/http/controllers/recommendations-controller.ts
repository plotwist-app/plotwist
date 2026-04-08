import type { FastifyRedis } from '@fastify/redis'
import type { Language } from '@plotwist_app/tmdb'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getReceivedRecommendationsService } from '@/domain/services/recommendations/get-received-recommendations'
import { respondRecommendationService } from '@/domain/services/recommendations/respond-recommendation'
import { sendRecommendationService } from '@/domain/services/recommendations/send-recommendation'
import {
  getRecommendationsQuerySchema,
  respondRecommendationBodySchema,
  respondRecommendationParamsSchema,
  sendRecommendationBodySchema,
} from '../schemas/recommendations'

export async function sendRecommendationController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = sendRecommendationBodySchema.parse(request.body)

  const result = await sendRecommendationService({
    fromUserId: request.user.id,
    toUserId: body.toUserId,
    tmdbId: body.tmdbId,
    mediaType: body.mediaType,
    message: body.message ?? null,
  })

  return reply.status(201).send(result)
}

export async function getReceivedRecommendationsController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { language } = getRecommendationsQuerySchema.parse(request.query)

  const result = await getReceivedRecommendationsService(
    request.user.id,
    redis,
    language as Language
  )

  return reply.status(200).send(result)
}

export async function respondRecommendationController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = respondRecommendationParamsSchema.parse(request.params)
  const { status } = respondRecommendationBodySchema.parse(request.body)

  const result = await respondRecommendationService({
    id,
    userId: request.user.id,
    status,
  })

  return reply.status(200).send(result)
}
