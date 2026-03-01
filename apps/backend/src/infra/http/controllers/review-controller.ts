import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'
import { createReviewService } from '@/domain/services/reviews/create-review'
import { deleteReviewService } from '@/domain/services/reviews/delete-review'
import { getReviewService } from '@/domain/services/reviews/get-review'
import { getReviewsService } from '@/domain/services/reviews/get-reviews'
import { updateReviewService } from '@/domain/services/reviews/update-review'
import { getTMDBDataService } from '@/domain/services/tmdb/get-tmdb-data'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import { deleteUserActivityByEntityService } from '@/domain/services/user-activities/delete-user-activity'
import { invalidateUserStatsCache } from '@/domain/services/user-stats/cache-utils'
import {
  createReviewBodySchema,
  getReviewQuerySchema,
  getReviewsQuerySchema,
  reviewParamsSchema,
  updateReviewBodySchema,
} from '../schemas/reviews'

export async function createReviewController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
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

  await invalidateUserStatsCache(redis, request.user.id)

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
  reply: FastifyReply,
  redis: FastifyRedis
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

  await invalidateUserStatsCache(redis, result.userId)

  return reply.status(204).send()
}

export async function updateReviewController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { id } = reviewParamsSchema.parse(request.params)
  const body = updateReviewBodySchema.parse(request.body)

  const result = await updateReviewService({ ...body, id })

  await invalidateUserStatsCache(redis, request.user.id)

  return reply.status(200).send(result.review)
}

export async function getDetailedReviewsController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const {
    limit: limitStr,
    page: pageStr,
    language,
    orderBy,
    userId,
    interval,
  } = getReviewsQuerySchema.parse(request.query)

  const limit = Number(limitStr) || 20
  const page = Number(pageStr) || 1

  const result = await getReviewsService({
    orderBy,
    userId,
    interval,
    limit,
    page,
  })

  // Check if there are more results (we fetched limit + 1)
  const hasMore = result.reviews.length > limit
  const reviews = hasMore ? result.reviews.slice(0, limit) : result.reviews

  const mergedReviews = await Promise.all(
    reviews.map(async review => {
      const tmdbData = await getTMDBDataService(redis, {
        language: language || 'en-US',
        mediaType: review.mediaType,
        tmdbId: review.tmdbId,
      })

      return { ...review, ...tmdbData }
    })
  )

  return reply.status(200).send({
    reviews: mergedReviews,
    pagination: {
      page,
      limit,
      hasMore,
    },
  })
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
