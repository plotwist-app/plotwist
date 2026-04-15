import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import { createUserEpisodesService } from '@/domain/services/user-episodes/create-user-episodes'
import { deleteUserEpisodesService } from '@/domain/services/user-episodes/delete-user-episodes'
import { getUserEpisodesService } from '@/domain/services/user-episodes/get-user-episodes'
import { invalidateUserStatsCache } from '@/domain/services/user-stats/cache-utils'
import {
  createUserEpisodesBodySchema,
  deleteUserEpisodesBodySchema,
  getUserEpisodesQuerySchema,
} from '../schemas/user-episodes'

export async function createUserEpisodesController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const body = createUserEpisodesBodySchema.parse(request.body)

  const result = await createUserEpisodesService(
    body.map(userEpisode => ({ ...userEpisode, userId: request.user.id }))
  )

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  await createUserActivity({
    userId: request.user.id,
    activityType: 'WATCH_EPISODE',
    metadata: body,
  })

  await invalidateUserStatsCache(redis, request.user.id)

  return reply.status(201).send(result.userEpisodes)
}

export async function getUserEpisodesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tmdbId } = getUserEpisodesQuerySchema.parse(request.query)

  const result = await getUserEpisodesService({
    tmdbId: Number(tmdbId),
    userId: request.user.id,
  })

  return reply.status(200).send(result.userEpisodes)
}

export async function deleteUserEpisodesController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { ids } = deleteUserEpisodesBodySchema.parse(request.body)
  await deleteUserEpisodesService(ids)

  await invalidateUserStatsCache(redis, request.user.id)

  return reply.status(204).send()
}
