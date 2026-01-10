import { likeAcvityType } from '@/@types/user-activity'
import { createLikeService } from '@/domain/services/likes/create-like'
import { deleteLikeService } from '@/domain/services/likes/delete-like'
import { getLikesService } from '@/domain/services/likes/get-likes'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import { deleteUserActivityByEntityService } from '@/domain/services/user-activities/delete-user-activity'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createLikeBodySchema,
  deleteLikeParamsSchema,
  getLikesParamsSchema,
} from '../schemas/likes'

export async function createLikeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { entityId, entityType } = createLikeBodySchema.parse(request.body)
  const { like } = await createLikeService({
    entityId,
    entityType,
    userId: request.user.id,
  })

  await createUserActivity({
    activityType: likeAcvityType[like.entityType],
    userId: request.user.id,
    entityId: like.entityId,
    entityType: like.entityType,
  })

  return reply.status(201).send({ like })
}

export async function deleteLikeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = deleteLikeParamsSchema.parse(request.params)

  const { like } = await deleteLikeService(id)

  await deleteUserActivityByEntityService({
    activityType: likeAcvityType[like.entityType],
    entityType: like.entityType,
    entityId: like.entityId,
    userId: request.user.id,
  })

  return reply.status(204).send()
}

export async function getLikesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { entityId } = getLikesParamsSchema.parse(request.params)
  const { likes } = await getLikesService(entityId)

  return reply.status(200).send({ likes })
}
