import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createReviewBodySchema,
  getReviewQuerySchema,
  getReviewsQuerySchema,
  reviewParamsSchema,
  updateReviewBodySchema,
} from '../schemas/reviews'

import { DomainError } from '@/domain/errors/domain-error'
import { createReviewService } from '@/domain/services/reviews/create-review'
import { deleteReviewService } from '@/domain/services/reviews/delete-review'

import { getReviewService } from '@/domain/services/reviews/get-review'
import { getReviewsService } from '@/domain/services/reviews/get-reviews'
import { updateReviewService } from '@/domain/services/reviews/update-review'
import { getTMDBDataService } from '@/domain/services/tmdb/get-tmdb-data'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import { deleteUserActivityByEntityService } from '@/domain/services/user-activities/delete-user-activity'

export async function createReviewController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createReviewBodySchema.parse(request.body)

  const result = await createReviewService({
    ...body,
    userId: request.user.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  await createUserActivity({
    userId: result.review.userId,
    activityType: 'CREATE_REVIEW',
    entityId: result.review.id,
    entityType: 'REVIEW',
    metadata: {
      tmdbId: body.tmdbId,
      mediaType: body.mediaType,
      seasonNumber: body.seasonNumber,
      episodeNumber: body.episodeNumber,
    },
  })

  return reply.status(201).send({ review: result.review })
}

export async function getReviewsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {
    mediaType,
    tmdbId,
    userId,
    limit,
    interval,
    seasonNumber,
    episodeNumber,
  } = getReviewsQuerySchema.parse(request.query)

  const result = await getReviewsService({
    mediaType,
    userId,
    authenticatedUserId: request.user?.id,
    interval,
    tmdbId: Number(tmdbId),
    limit: Number(limit),
    seasonNumber: seasonNumber ? Number(seasonNumber) : undefined,
    episodeNumber: episodeNumber ? Number(episodeNumber) : undefined,
  })

  return reply.status(200).send(result.reviews)
}

export async function deleteReviewController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = reviewParamsSchema.parse(request.params)
  const result = await deleteReviewService(id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  await deleteUserActivityByEntityService({
    activityType: 'CREATE_REVIEW',
    entityType: 'REVIEW',
    entityId: result.id,
    userId: result.userId,
  })

  return reply.status(204).send()
}

export async function updateReviewController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = reviewParamsSchema.parse(request.params)
  const body = updateReviewBodySchema.parse(request.body)

  const result = await updateReviewService({ ...body, id })

  return reply.status(200).send(result.review)
}

export async function getDetailedReviewsController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { limit, language, orderBy, userId, interval } =
    getReviewsQuerySchema.parse(request.query)

  const result = await getReviewsService({
    orderBy,
    userId,
    interval,
    limit: Number(limit),
  })

  const mergedReviews = await Promise.all(
    result.reviews.map(async review => {
      const tmdbData = await getTMDBDataService(redis, {
        language: language || 'en-US',
        mediaType: review.mediaType,
        tmdbId: review.tmdbId,
      })

      return { ...review, ...tmdbData }
    })
  )

  return reply.status(200).send({ reviews: mergedReviews })
}

export async function getReviewController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { mediaType, tmdbId, seasonNumber, episodeNumber } =
    getReviewQuerySchema.parse(request.query)

  const result = await getReviewService({
    mediaType,
    userId: request.user.id,
    tmdbId: Number(tmdbId),
    seasonNumber: Number(seasonNumber),
    episodeNumber: Number(episodeNumber),
  })

  return reply.status(200).send(result)
}
