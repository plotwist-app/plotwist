import type { FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'
import { createFollowService } from '@/domain/services/follows/create-follow'
import { deleteFollowService } from '@/domain/services/follows/delete-follow'
import { getFollowService } from '@/domain/services/follows/get-follow'
import { getFollowersService } from '@/domain/services/follows/get-followers'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import { deleteFollowUserActivityService } from '@/domain/services/user-activities/delete-user-activity'
import {
  createFollowBodySchema,
  deleteFollowBodySchema,
  getFollowersQuerySchema,
  getFollowQuerySchema,
} from '../schemas/follow'

export async function createFollowController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = createFollowBodySchema.parse(request.body)

  const result = await createFollowService({
    followedId: userId,
    followerId: request.user.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  await createUserActivity({
    userId: request.user.id,
    activityType: 'FOLLOW_USER',
    metadata: result.follow,
  })

  return reply.send(201).send(result)
}

export async function getFollowController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = getFollowQuerySchema.parse(request.query)

  const result = await getFollowService({
    followedId: userId,
    followerId: request.user.id,
  })

  return reply.status(200).send(result)
}

export async function deleteFollowController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = deleteFollowBodySchema.parse(request.body)
  const { follow } = await deleteFollowService({
    followedId: userId,
    followerId: request.user.id,
  })

  await deleteFollowUserActivityService(
    follow.followedId,
    follow.followerId,
    request.user.id
  )

  return reply.status(204).send()
}

export async function getFollowersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { pageSize, ...query } = getFollowersQuerySchema.parse(request.query)

  const result = await getFollowersService({
    ...query,
    pageSize: Number(pageSize),
  })

  return reply.status(200).send(result)
}
